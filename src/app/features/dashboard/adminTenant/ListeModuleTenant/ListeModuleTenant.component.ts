import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import {ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-module-tenant',
  standalone: true, // Ton composant est probablement standalone
  imports: [CommonModule,FormsModule,RouterLink, RouterLinkActive],
  templateUrl: './ListeModuleTenant.component.html',
  styleUrls: ['./ModuleTenant.component.css']
})
export class ListeModuleTenantComponent implements OnInit {
  // Liste des modules liés au tenant
  myModules: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  selectedMyModulesIds = new Set<number>();

  constructor(
    private moduleTenantService: ModuleTenantService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.loadMyCatalogue();

  }

  /**
   * Charge les modules du catalogue du tenant actuel
   */
  loadMyCatalogue(): void {
    this.loading = true;
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur; // Ici, userId sera égal à 7

    if (!userId) {
      this.errorMessage = "Impossible de récupérer votre identifiant.";
      this.loading = false;
      return;
    }

    this.moduleTenantService.getMyModules(userId).subscribe({
      next: (data) => {

        this.myModules = [...data];
        this.loading = false;
        console.log("Modules chargés avec succès :", data);

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

  /**
   * Supprime un module du catalogue
   * @param moduleTenantId L'ID de la liaison (la clé primaire 'id' du JSON)
   */
  onRemoveModule(moduleTenantId: number): void {
    if (confirm('Voulez-vous vraiment retirer ce module de votre catalogue ?')) {
      this.moduleTenantService.deleteModuleTenant(moduleTenantId).subscribe({
        next: () => {
          // Mise à jour locale de la liste pour éviter un rechargement complet
          this.myModules = this.myModules.filter(m => m.id !== moduleTenantId);
          alert('Module retiré avec succès.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          alert('Erreur lors de la suppression du module.');
          this.cdr.detectChanges();
        }
      });
    }
  }

toggleMyModuleSelection(id: number): void {
  if (this.selectedMyModulesIds.has(id)) {
    this.selectedMyModulesIds.delete(id);
  } else {
    this.selectedMyModulesIds.add(id);
  }
}

toggleAllMyModules(event: any): void {
  if (event.target.checked) {
    this.myModules.forEach(mt => this.selectedMyModulesIds.add(mt.id));
  } else {
    this.selectedMyModulesIds.clear();
  }
}

isAllMyModulesSelected(): boolean {
  return this.myModules.length > 0 && this.selectedMyModulesIds.size === this.myModules.length;
}

// --- SUPPRESSION GROUPÉE ---

onBulkRemove(): void {
  if (confirm(`Voulez-vous vraiment retirer ces ${this.selectedMyModulesIds.size} modules ?`)) {
    this.loading = true;

    // Création de toutes les requêtes de suppression
    const requests = Array.from(this.selectedMyModulesIds).map(id =>
      this.moduleTenantService.deleteModuleTenant(id).toPromise()
    );

    Promise.all(requests)
      .then(() => {
        alert('Modules retirés avec succès.');
        this.selectedMyModulesIds.clear(); // Vider la sélection
        this.loadMyCatalogue(); // Recharger les deux listes pour rafraîchir les filtres
      })
      .catch(err => {
        console.error(err);
        alert('Erreur lors de la suppression de certains modules.');
      })
      .finally(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
}

}
