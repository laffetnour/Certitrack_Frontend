import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialiteModuleService } from '../../../../core/services/SpecialiteModule.service';
import { EtablissementService } from '../../../../core/services/etablissement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './AffichageListe.component.html',
  styleUrls: ['./ListeModule.component.css']
})
export class AffichageListeComponent implements OnInit {
  specialites: any[] = [];
  selectedSpecId: number | null = null;
  modulesAffectes: any[] = [];
  currentMode: string = 'FIXE';
  loading: boolean = false;
  allSpecialities: any[] = [];
  allModulesData: any[] = [];
  allModulesEtab: any[] = [];
  availableModules: any[] = [];
  selectedModuleId: number | null = null;
  showAddModal: boolean = false;
  searchTerm: string = '';
  selectedIds: Set<number> = new Set();

  constructor(
    private etablissementService: EtablissementService,
    private cdr: ChangeDetectorRef,
    private specModuleService: SpecialiteModuleService,
    private moduleTenantService: ModuleTenantService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadAllSpecialiteModules(true);
  }


  loadAllSpecialiteModules(shouldFilter: boolean = false): void {
      this.loading = true;

      this.specModuleService.getAllSpecialiteModules().subscribe({
        next: (data) => {
          const sortedData = data.sort((a, b) =>
            a.specialite?.nom.localeCompare(b.specialite?.nom)
          );

          this.allModulesData = sortedData;
          this.modulesAffectes = [...sortedData];


          if (shouldFilter) {
                  this.onSpecChange();
                } else {
                  this.onSpecChange();
                }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur lors du chargement global :", err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onSpecChange(): void {
    if (!this.selectedSpecId || this.selectedSpecId.toString() === 'null') {
      this.modulesAffectes = [...this.allModulesData];
    } else {
      this.modulesAffectes = this.allModulesData.filter(
        item => item.specialite?.idSpecialite == this.selectedSpecId
      );
    }
    this.cdr.detectChanges();
  }
    loadSpecialites(): void {
      this.loading = true;
      const user = this.authService.getUser();
      const etabId = user?.etablissements?.[0]?.idEtab;
     if (etabId) {
             this.etablissementService.getSpecialites(etabId).subscribe({
               next: (specs) => {
                 this.allSpecialities = specs;
                 this.loading = false;
                 this.cdr.detectChanges();
               },
               error: (err) => {
                 console.error("Erreur lors du chargement des spécialités", err);
                 this.loading = false;
                 this.cdr.detectChanges();
                 }

             });
           } else {
             console.warn("Aucun ID d'établissement trouvé pour cet utilisateur.");

           }
    }

  updateGlobalMode(newMode: string): void {
    if (!this.selectedSpecId) return;

    this.specModuleService.updateModeBySpec(this.selectedSpecId, newMode).subscribe({
      next: () => {
        this.currentMode = newMode;
        this.allModulesData = this.allModulesData.map(item => {
          if (item.specialite?.idSpecialite == this.selectedSpecId) {
            return { ...item, modeAffichage: newMode };
          }
          return item;
        });

        this.onSpecChange();

        this.cdr.detectChanges();
        alert(`La spécialité est maintenant en mode ${newMode}`);
      }
    });
  }

    retirerModule(idLiaison: number): void {
      if (confirm("Voulez-vous vraiment retirer ce module de cette spécialité ?")) {
        this.specModuleService.deleteLiaison(idLiaison).subscribe({
          next: () => {
            this.modulesAffectes = this.modulesAffectes.filter(m => m.id !== idLiaison);
            this.loadAllSpecialiteModules(true);
            this.cdr.detectChanges();
          }
        });
      }
    }

  toggleSelection(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll(event: any): void {
    if (event.target.checked) {
      this.modulesAffectes.forEach(m => this.selectedIds.add(m.id));
    } else {
      this.selectedIds.clear();
    }
  }

  loadAvailableModules(): void {
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur;

    if (userId) {
      this.loading = true;
      this.moduleTenantService.getMyModules(userId).subscribe({
        next: (allModules) => {
          this.allModulesEtab = allModules;
          console.log(allModules);
          const idsDejaPresents = new Set(
            this.allModulesData
              .filter(am => am.specialite?.idSpecialite == this.selectedSpecId)
              .map(am => am.moduleTenant?.id)
          );
          this.availableModules = this.allModulesEtab.filter(
            m => !idsDejaPresents.has(m.id)
          );

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur chargement modules disponibles", err);
          this.loading = false;
        }
      });
    }
  }
    get filteredAvailableModules() {
      return this.availableModules.filter(m =>
        m.module?.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }


  selectedModulesToAdd: Set<number> = new Set();

  openAddModal(): void {
    this.selectedModulesToAdd.clear();
    this.searchTerm = '';
    this.showAddModal = true;
    this.loadAvailableModules();
  }


  toggleModuleSelection(moduleId: number): void {
    if (this.selectedModulesToAdd.has(moduleId)) {
      this.selectedModulesToAdd.delete(moduleId);
    } else {
      this.selectedModulesToAdd.add(moduleId);
    }
    this.selectedModulesToAdd = new Set(this.selectedModulesToAdd);
    this.cdr.detectChanges();
  }

  toggleCheckbox(event: any, moduleId: number): void {
    event.stopPropagation();
    this.toggleModuleSelection(moduleId);
  }


  ajouterModulesSelectionnes(): void {
    if (this.selectedModulesToAdd.size === 0 || !this.selectedSpecId) return;

    this.loading = true;
    const user = this.authService.getUser();
    const moduleExistant = this.allModulesData.find(
      m => m.specialite?.idSpecialite == this.selectedSpecId
    );

    let modeAUtiliser: string;

    if (moduleExistant && moduleExistant.modeAffichage) {
      modeAUtiliser = moduleExistant.modeAffichage;
      console.log(`🔍 Mode détecté pour la spécialité : ${modeAUtiliser}`);
    } else {
      modeAUtiliser = this.currentMode || 'FIXE';
      console.log(`🆕 Aucun module existant, utilisation du mode par défaut : ${modeAUtiliser}`);
    }

    const requests = Array.from(this.selectedModulesToAdd).map(moduleId => {
      const payload = {
        specialiteIds: [Number(this.selectedSpecId)],
        moduleTenantIds: [Number(moduleId)],
        modeAffichage: modeAUtiliser,
        ajoutePar: user?.nom || 'Directeur'
      };

      return this.specModuleService.affecterModules(payload);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.showAddModal = false;
        const count = this.selectedModulesToAdd.size;
        this.selectedModulesToAdd = new Set();
        this.loadAllSpecialiteModules(true);

        alert(`${count} module(s) ajouté(s) en mode ${modeAUtiliser} !`);
      },
      error: (err) => {
        console.error("❌ Erreur :", err);
        alert("Erreur lors de l'ajout.");
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

    supprimerSelection(): void {
      if (this.selectedIds.size === 0) return;
      if (confirm(`Voulez-vous vraiment supprimer les ${this.selectedIds.size} modules sélectionnés ?`)) {
        this.loading = true;
        const deletePromises = Array.from(this.selectedIds).map(id =>
          this.specModuleService.deleteLiaison(id).toPromise()
        );

        Promise.all(deletePromises).then(() => {
          this.allModulesData = this.allModulesData.filter(m => !this.selectedIds.has(m.id));
          this.selectedIds.clear();
          this.onSpecChange();
          this.loading = false;
          this.cdr.detectChanges();
        }).catch(err => {
          console.error("Erreur lors de la suppression groupée", err);
          this.loading = false;
        });
      }
    }
}
