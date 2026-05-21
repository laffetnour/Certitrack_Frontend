import { Component, OnInit } from '@angular/core';
import { DirecteurService } from '../../../../core/services/directeur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { EtablissementService } from '../../../../core/services/etablissement.service';
import { ContextService } from '../../../../core/services/context.service';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SpecialiteModuleService } from '../../../../core/services/SpecialiteModule.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-specialite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './specialite.component.html',
  styleUrls: ['./specialite.component.css']
})
export class SpecialiteComponent implements OnInit {

  specialites: any[] = [];
  selectedIds: number[] = [];
  originalNom: string = '';
  loading = true;

originalModuleIds: number[] = [];

originalMode: string = '';
originalModules: number[] = [];

  activeModules: any[] = [];
  selectedModuleIds: Set<number> = new Set();
  moduleSearchTerm: string = '';
  isModalLoading = false;


  showModal = false;
  isEdit = false;
  form: any = { nom: '' };
  currentId: number | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(private directeurService: DirecteurService,
              private cdr: ChangeDetectorRef,
              private moduleTenantService: ModuleTenantService,
              private specModuleService: SpecialiteModuleService,
              private authService: AuthService,
              private etablissementService: EtablissementService,
              private contextService: ContextService ) {}

  ngOnInit(): void {
    this.loadSpecialites();
  }



getModulesRoute(): string {
  const idEtab = this.contextService.getEtablissementId();
  const user = this.authService.getUser();
  const role = user.role

  if ((role === 'superAdmin' || role === 'SUPER_ADMIN')) {
      const idTenant = this.contextService.getTenantId(); // Tu dois avoir l'ID du tenant parent
      if (idTenant && idEtab) {
        return `/super-admin/tenant/${idTenant}/etablissement/${idEtab}/modules`;
      }
    }

  if (role === 'adminTenant' && idEtab) {
    return `/adminTenant/etablissement/${idEtab}/modules`;
  }
  return '/directeur/modules';
}

getListModulesRoute(): string {
  const idEtab = this.contextService.getEtablissementId();
   const user = this.authService.getUser();
    const role = user.role

    if ((role === 'superAdmin' || role === 'SUPER_ADMIN')) {
        const idTenant = this.contextService.getTenantId();
        if (idTenant && idEtab) {
          return `/super-admin/tenant/${idTenant}/etablissement/${idEtab}/Listemodules`;
        }
      }
  if (role === 'adminTenant' && idEtab) {
    return `/adminTenant/etablissement/${idEtab}/Listemodules`;
  }
  return '/directeur/Listemodules';
}


loadSpecialites() {
    this.loading = true;
    const user = this.authService.getUser();
    const id = this.contextService.getEtablissementId() || user?.etablissements?.[0]?.idEtab || user?.etablissement?.idEtab;
    this.etablissementService.getSpecialites(id).subscribe({
        next: (data) => {
            this.specialites = data || [];
            this.loading = false;
            this.cdr.detectChanges();
        },
        error: () => this.loading = false
    });
}


  onCheckboxChange(id: number, event: any) {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.specialites.map(s => s.idSpecialite);
    } else {
      this.selectedIds = [];
    }
  }

  isAllSelected() {
    return this.specialites.length > 0 &&
      this.selectedIds.length === this.specialites.length;
  }

  trackById(index: number, item: any) {
    return item.idSpecialite;
  }


  closeModal() {
    this.showModal = false;
  }

 toggle(sp: any) {
    this.directeurService.toggleSpecialite(sp.idSpecialite)
      .subscribe(() => this.loadSpecialites());
  }

  activateSelected() {
    this.directeurService.activateMultipleSpecialites(this.selectedIds)
      .subscribe(() => {
        this.loadSpecialites();
        this.selectedIds = [];
      });
  }

  deactivateSelected() {
    this.directeurService.deactivateMultipleSpecialites(this.selectedIds)
      .subscribe(() => {
        this.loadSpecialites();
        this.selectedIds = [];
      });
  }


deleteSelected() {
  if (this.selectedIds.length === 0) return;

  const calls = this.selectedIds.map(id =>
    this.directeurService.deleteSpecialite(id)
  );

  forkJoin(calls).subscribe(() => {
    this.successMessage = "Suppression réussie";
    this.selectedIds = [];
    this.loadSpecialites();
  });
}

isSubmitDisabled(): boolean {
  const nom = this.form.nom?.trim();
  if (!nom) return true;
  if (!this.isEdit) return false;
  const nomChanged = nom !== this.originalNom;
  const modeChanged = this.form.modeAffichage !== this.originalMode;
  const currentIds = Array.from(this.selectedModuleIds);
  const modulesChanged = currentIds.length !== this.originalModuleIds.length ||
                         currentIds.some(id => !this.originalModuleIds.includes(id));

  return !(nomChanged || modeChanged || modulesChanged);
}

loadActiveTenantModules() {
  const user = this.authService.getUser();
  if (user?.idUtilisateur) {
    this.moduleTenantService.getActiveModules(user.idUtilisateur).subscribe(data => {
      this.activeModules = data;
      this.cdr.detectChanges();
    });
  }
}



get filteredModules() {
  const term = this.moduleSearchTerm.toLowerCase().trim();
  if (!term) return this.activeModules;

  return this.activeModules.filter(mt => {
    const mod = mt.module;
    if (!mod) return false;

    const nom = mod.nom?.toLowerCase() || '';
    const catString = Array.isArray(mod.categories)
          ? mod.categories.map((c: any) => c.nom || c.description || '').join(' ').toLowerCase()
          : '';
    const tagsString = Array.isArray(mod.motCles)
          ? mod.motCles.map((t: any) => t.description || '').join(' ').toLowerCase()
          : '';

    return nom.includes(term) || catString.includes(term) || tagsString.includes(term);
  });
}

toggleModule(id: number) {
  if (this.selectedModuleIds.has(id)) {
    this.selectedModuleIds.delete(id);
  } else {
    this.selectedModuleIds.add(id);
  }
}
openAdd() {
  this.isEdit = false;
  this.form = { nom: '', modeAffichage: 'FIXE' };
  this.selectedModuleIds.clear();
  this.loadActiveTenantModules();
  this.showModal = true;
}

save() {
  if (this.isSubmitDisabled()) return;

  const user = this.authService.getUser();
  const idEtab = this.contextService.getEtablissementId();
  const specAction = this.isEdit
    ? this.directeurService.updateSpecialite(this.currentId!, this.form)
    : this.directeurService.addSpecialite(this.form, idEtab);

  specAction.subscribe((savedSpec: any) => {
    const specId = this.isEdit ? this.currentId : savedSpec.idSpecialite;
    const payload = {
      specialiteIds: [specId],
      moduleTenantIds: Array.from(this.selectedModuleIds),
      modeAffichage: this.form.modeAffichage,
      ajoutePar: user?.nom || 'Directeur'
    };

    this.specModuleService.affecterModules(payload).subscribe({
      next: () => {
        if (this.isEdit) {
          this.specModuleService.updateModeBySpec(specId!, this.form.modeAffichage).subscribe({
            next: () => {
              this.successMessage = "Spécialité et tous les modules mis à jour en mode " + this.form.modeAffichage;
              this.finalizeSave();
            }
          });
        } else {
          this.successMessage = "Enregistrement réussi";
          this.finalizeSave();
        }
      }
    });
  });
}

finalizeSave() {
  this.loadSpecialites();
  this.closeModal();
  this.cdr.detectChanges();
}

openEdit(sp: any) {
  this.isEdit = true;
  this.currentId = sp.idSpecialite;
  this.originalNom = sp.nom;
  this.form = { nom: sp.nom, modeAffichage: 'FIXE' };

  this.selectedModuleIds.clear();
  this.moduleSearchTerm = '';
  this.isModalLoading = true;
  //this.loading = true;

  const user = this.authService.getUser();
  if (user?.idUtilisateur) {
    forkJoin({
      allModules: this.moduleTenantService.getActiveModules(user.idUtilisateur),
      currentLinks: this.specModuleService.getModulesBySpec(this.currentId!)
    }).subscribe({
      next: (res) => {
        this.activeModules = res.allModules;
        if (res.currentLinks && res.currentLinks.length > 0) {

        const currentMode = res.currentLinks [0].modeAffichage;
                this.form.modeAffichage = currentMode;
                this.originalMode = currentMode;
         this.originalModules = res.currentLinks.map((link: any) => link.moduleTenant?.id);

          const ids: number[] = [];
          res.currentLinks.forEach((link: any) => {
            if (link.moduleTenant) {
              this.selectedModuleIds.add(link.moduleTenant.id);
              ids.push(link.moduleTenant.id);
            }
          });

          this.originalModuleIds = ids;
        } else {
          this.form.modeAffichage = 'FIXE';
                  this.originalMode = 'FIXE';
                  this.originalModuleIds = [];
        }
         this.isModalLoading  = false;
        this.showModal = true;
        this.cdr.detectChanges();
      }
    });
  }
}


delete(sp: any) {

  const confirmFirst = confirm(`Voulez-vous vraiment supprimer la spécialité "${sp.nom}" ?`);

  if (confirmFirst) {
    this.loading = true;
    this.specModuleService.getModulesBySpec(sp.idSpecialite).subscribe({
      next: (modules) => {
        if (modules && modules.length > 0) {

          this.loading = false;
          alert(`Action impossible : Vous devez supprimer les modules affectés à la spécialité "${sp.nom}" avant de pouvoir la supprimer.`);
          this.errorMessage = "Suppression avortée : modules encore présents.";
          this.loadSpecialites();
          this.cdr.detectChanges();
        } else {
          const user = this.authService.getUser();

          const idEtab = this.contextService.getEtablissementId() || user?.etablissements?.[0]?.idEtab ||  user?.etablissement?.idEtab  ;

          this.directeurService.deleteSpecialite(sp.idSpecialite,idEtab).subscribe({
            next: () => {
              this.successMessage = "Suppression réussie !";
              this.errorMessage = '';
              this.loadSpecialites();
            },
            error: (err) => {
              this.errorMessage = "Erreur lors de la suppression sur le serveur.";
              this.loading = false;
            }
          });
        }
      },
      error: (err) => {
        console.error("Erreur lors de la vérification des modules", err);
        this.loading = false;
      }
    });
  }
}
}
