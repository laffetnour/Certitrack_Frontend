import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import {ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-module-tenant',
  standalone: true, // Ton composant est probablement standalone
  imports: [CommonModule,FormsModule,RouterLink, RouterLinkActive],
  templateUrl: './ModuleTenant.component.html',
  styleUrls: ['./ModuleTenant.component.css']
})
export class ModuleTenantComponent implements OnInit {
  // Liste des modules liés au tenant
  idTenant: string | null = null;
  myModules: any[] = [];
  loading: boolean = false;
   errorMessage: string = '';

    filteredModules: any[] = [];
    searchTerm: string = '';
    categoryFilter: string = '';
      categories: string[] = [];
    selectedIds = new Set<number>();
    allModules: any[] = [];

    submitting: boolean = false;


  constructor(
    private moduleTenantService: ModuleTenantService,
    private superAdminService: SuperAdminService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.idTenant = params.get('idTenant');
      this.loadMyCatalogue();
    });
  }

private getTargetId(): number {
  const user = this.authService.getUser();
  if ((user?.role === 'superAdmin' || user?.role === 'SUPER_ADMIN') && this.idTenant) {
    return Number(this.idTenant);
  }
  return user?.idUtilisateur;
}

loadMyCatalogue(): void {
  const targetId = this.getTargetId();
      if (!targetId) {
            this.errorMessage = "Impossible de récupérer l'identifiant cible.";
            return;
          }
    this.loading = true;
    //const user = this.authService.getUser();
    //const userId = user?.idUtilisateur; // Ici, userId sera égal à 7

    /*if (!userId) {
      this.errorMessage = "Impossible de récupérer votre identifiant.";
      this.loading = false;
      return;
    }*/

    this.moduleTenantService.getMyModules(targetId).subscribe({
      next: (data) => {

        this.myModules = [...data];
        this.loading = false;
        console.log("Modules chargés avec succès :", data);

        this.loadGlobalCatalogue()
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur catalogue', err);
        this.errorMessage = "Erreur lors de la récupération des modules.";
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
loadGlobalCatalogue(): void {
  this.loading = true;
  this.superAdminService.getModules().subscribe({
    next: (data) => {
      this.allModules = data;
      this.filterAvailableModules();
      this.categories = [...new Set(this.filteredModules.map(m => m.nomCategorie))]
                          .filter(c => c) as string[];
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

filterAvailableModules(): void {
  // 1. Récupérer les IDs des modules déjà possédés
  const ownedIds = this.myModules.map(m => m.module.idModule);

  // 2. Appliquer le double filtre
  this.filteredModules = this.allModules.filter(m => {
    const isNotOwned = !ownedIds.includes(m.idModule);
    const isAvailable = m.disponibilite === true;

    return isNotOwned && isAvailable;
  });
}


onSearch(): void {
  const term = this.searchTerm.toLowerCase();
  const ownedIds = this.myModules.map(m => m.module.idModule);

  this.filteredModules = this.allModules.filter((m: any) => {
    const isNotOwned = !ownedIds.includes(m.idModule);
    const isAvailable = m.disponibilite === true;

    const matchSearch = m.nom.toLowerCase().includes(term) ||
                        (m.nomCategorie && m.nomCategorie.toLowerCase().includes(term));

    const matchCat = !this.categoryFilter || m.nomCategorie === this.categoryFilter;

    return isNotOwned && isAvailable && matchSearch && matchCat;
  });

  this.selectedIds.clear();
}

  toggleSelection(id: number): void {
      this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
    }

    toggleAll(event: any): void {
      if (event.target.checked) {
        this.filteredModules.forEach(m => this.selectedIds.add(m.idModule));
      } else {
        this.selectedIds.clear();
      }
    }

    isAllSelected(): boolean {
      return this.filteredModules.length > 0 && this.selectedIds.size === this.filteredModules.length;
    }

    // --- Actions d'ajout ---
    addSingleModule(moduleId: number): void {
      this.selectedIds.clear();
      this.selectedIds.add(moduleId);
      this.confirmSelection();
    }

    confirmSelection(): void {
      /*const user = this.authService.getUser();
      if (!user || this.selectedIds.size === 0) return;

      this.submitting = true;
      const requests = Array.from(this.selectedIds).map(id =>
        this.moduleTenantService.addModuleToTenant(user.idUtilisateur, id).toPromise()
      );*/

    const targetId = this.getTargetId();
        if (!targetId || this.selectedIds.size === 0) return;

        this.submitting = true;
        const requests = Array.from(this.selectedIds).map(id =>
          this.moduleTenantService.addModuleToTenant(targetId, id).toPromise()
        );

      Promise.all(requests)
        .then(() => {
          alert(`${this.selectedIds.size} module(s) ajouté(s) avec succès !`);
          this.selectedIds.clear();
          this.loadGlobalCatalogue(); // Rafraîchir la liste possédée
        })
        .catch((err) => {
          console.error(err);
          alert("Erreur : Certains modules sont peut-être déjà dans votre catalogue.");
        })
        .finally(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        });
    }
}
