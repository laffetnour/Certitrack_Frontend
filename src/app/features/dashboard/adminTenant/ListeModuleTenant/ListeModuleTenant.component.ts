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

  selectedModuleForTest: any = null;

  testForm = {
    avecTest: false,
    seuilScore: null
  };

  selectedModuleConfig: any = null;

  configForm = {
    estActif: false,
    avecTest: false
  };


  // Liste pour l'affichage filtré
  filteredMyModules: any[] = [];

// Variables pour les modèles de filtres
  searchTerm: string = '';
  testFilter: string = '';   // Valeurs : '', 'with', 'without'
  statusFilter: string = ''; // Valeurs : '', 'active', 'inactive'

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
    console.log(user);
    const userId = user?.idUtilisateur; // Ici, userId sera égal à 7

    if (!userId) {
      this.errorMessage = "Impossible de récupérer votre identifiant.";
      this.loading = false;
      return;
    }

    this.moduleTenantService.getMyModules(userId).subscribe({
      next: (data) => {

        this.myModules = [...data];
        this.applyFilters();//7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
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
          //alert('Module retiré avec succès.');
          this.applyFilters();//77777777777777777777777777777777777777777777777777777777777777777777777777777777777777
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
//7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
/*toggleMyModuleSelection(id: number): void {
  if (this.selectedMyModulesIds.has(id)) {
    this.selectedMyModulesIds.delete(id);
  } else {
    this.selectedMyModulesIds.add(id);
  }
}*/

/*toggleAllMyModules(event: any): void {
  if (event.target.checked) {
    this.myModules.forEach(mt => this.selectedMyModulesIds.add(mt.id));
  } else {
    this.selectedMyModulesIds.clear();
  }
}*/
//7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
  toggleAllMyModules(event: any): void {
    if (event.target.checked) {
      // On n'ajoute que les modules visibles dans le filtre
      this.filteredMyModules.forEach(mt => this.selectedMyModulesIds.add(mt.id));
    } else {
      // On ne retire que les modules visibles
      this.filteredMyModules.forEach(mt => this.selectedMyModulesIds.delete(mt.id));
    }
  }

/*isAllMyModulesSelected(): boolean {
  return this.myModules.length > 0 && this.selectedMyModulesIds.size === this.myModules.length;
}*/
//77777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
  isAllMyModulesSelected(): boolean {
    return this.filteredMyModules.length > 0 &&
      this.filteredMyModules.every(m => this.selectedMyModulesIds.has(m.id));
  }



  /*onBulkRemove(): void {
    if (confirm(`Voulez-vous vraiment retirer ces ${this.selectedMyModulesIds.size} modules ?`)) {
      this.loading = true;
      const ids = Array.from(this.selectedMyModulesIds);

      // On utilise le même principe de suppression
      const requests = ids.map(id => this.moduleTenantService.deleteModuleTenant(id).toPromise());

      Promise.all(requests)
        .then(() => {
          // Filtrer localement pour faire disparaître les lignes immédiatement
          this.myModules = this.myModules.filter(m => !this.selectedMyModulesIds.has(m.id));
          this.selectedMyModulesIds.clear();
        })
        .catch(err => {
          console.error(err);
          alert('Erreur lors de la suppression.');
        })
        .finally(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
    }
  }*/

  onBulkRemove(): void {
    if (confirm(`Voulez-vous vraiment retirer ces ${this.selectedMyModulesIds.size} modules ?`)) {
      this.loading = true;
      const ids = Array.from(this.selectedMyModulesIds);

      const requests = ids.map(id => this.moduleTenantService.deleteModuleTenant(id).toPromise());

      Promise.all(requests)
        .then(() => {
          // 1. On met à jour la source principale
          this.myModules = this.myModules.filter(m => !this.selectedMyModulesIds.has(m.id));

          // 2. On vide le Set de sélection
          this.selectedMyModulesIds.clear();

          // 3. ICI : On appelle applyFilters pour rafraîchir l'affichage !
          this.applyFilters();

          console.log('Suppression groupée réussie');
        })
        .catch(err => {
          console.error(err);
          alert('Erreur lors de la suppression.');
        })
        .finally(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
    }
  }

  openTestForm(mt: any) {
    this.selectedModuleForTest = mt;

    this.testForm = {
      avecTest: mt.avecTest,
      seuilScore: mt.seuilScore
    };
  }





  /*confirmTest() {
    const mt = this.selectedModuleForTest;

    if (this.testForm.avecTest && (!this.testForm.seuilScore || !this.testForm.dureeQCM)) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    this.moduleTenantService.configTest(
      mt.id,
      this.testForm.avecTest,
      this.testForm.seuilScore ?? null,
      this.testForm.dureeQCM ?? null
    ).subscribe({
      next: (updatedMt: any) => {
        // MISE À JOUR SYNCHRONE : On remplace l'ancien objet par le nouveau
        const index = this.myModules.findIndex(m => m.id === updatedMt.id);
        if (index !== -1) {
          this.myModules[index] = updatedMt;
          // On recrée la référence du tableau pour notifier Angular du changement
          this.myModules = [...this.myModules];
          this.applyFilters();//77777777777777777777777777777777777777777777777777777777777777777777777777777777777777
        }
        this.selectedModuleForTest = null;
        this.cdr.detectChanges(); // Sécurité supplémentaire pour le rendu
      },
      error: (err) => {
        console.error("Erreur de configuration", err);
        alert("Erreur lors de la sauvegarde.");
      }
    });
  }*/

  confirmTest() {
    const mt = this.selectedModuleForTest;

    if (this.testForm.avecTest && !this.testForm.seuilScore) {
      alert("Veuillez remplir le seuil score");
      return;
    }

    this.moduleTenantService.configTest(
      mt.id,
      this.testForm.avecTest,
      this.testForm.seuilScore ?? null
    ).subscribe({
      next: (updatedMt: any) => {
        const index = this.myModules.findIndex(m => m.id === updatedMt.id);
        if (index !== -1) {
          this.myModules[index] = updatedMt;
          this.myModules = [...this.myModules];
          this.applyFilters();
        }
        this.selectedModuleForTest = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de configuration", err);
        alert("Erreur lors de la sauvegarde.");
      }
    });
  }

  toggleModule(mt: any) {
    this.moduleTenantService.toggleModule(mt.id).subscribe({
      next: (updatedMt: any) => {
        const index = this.myModules.findIndex(m => m.id === updatedMt.id);
        if (index !== -1) {
          this.myModules[index] = updatedMt;
          this.applyFilters();//777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
          this.myModules = [...this.myModules];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur toggle", err);
      }
    });
  }






// --- LOGIQUE DE SÉLECTION ---

  toggleMyModuleSelection(id: number): void {
    if (this.selectedMyModulesIds.has(id)) {
      this.selectedMyModulesIds.delete(id);
    } else {
      this.selectedMyModulesIds.add(id);
    }
  }

  selectAll(event: any): void {
    if (event.target.checked) {
      this.myModules.forEach(mt => this.selectedMyModulesIds.add(mt.id));
    } else {
      this.selectedMyModulesIds.clear();
    }
  }

  isAllSelected(): boolean {
    return this.myModules.length > 0 && this.selectedMyModulesIds.size === this.myModules.length;
  }

// --- ACTIONS GROUPÉES ---

  activateSelected(): void {
    this.updateBulkStatus(true);
  }

  deactivateSelected(): void {
    this.updateBulkStatus(false);
  }

  private updateBulkStatus(status: boolean): void {
    const ids = Array.from(this.selectedMyModulesIds);

    this.moduleTenantService.bulkUpdateStatus(ids, status).subscribe({
      next: () => {
        // 1. Mettre à jour les objets dans la liste locale
        this.myModules = this.myModules.map(m => {
          if (this.selectedMyModulesIds.has(m.id)) {
            return { ...m, estActif: status }; // On crée une nouvelle référence d'objet
          }
          return m;
        });

        // 2. Vider la sélection
        this.selectedMyModulesIds.clear();
        this.applyFilters();//77777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777

        // 3. Forcer Angular à redessiner le tableau immédiatement
        this.cdr.detectChanges();

        // Note: J'ai supprimé l'alert() ici pour que l'utilisateur voit le changement direct
        console.log(status ? 'Modules activés' : 'Modules désactivés');
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour groupée", err);
        // On ne met une alerte qu'en cas d'erreur réelle
        alert("Une erreur est survenue lors de la modification.");
      }
    });
  }

  applyFilters(): void {
    this.filteredMyModules = this.myModules.filter(mt => {
      // Filtre Recherche Nom
      const matchesSearch = mt.module.nom.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre Avec/Sans Test
      let matchesTest = true;
      if (this.testFilter === 'with') matchesTest = mt.avecTest === true;
      if (this.testFilter === 'without') matchesTest = mt.avecTest === false;

      // Filtre Actif/Inactif
      let matchesStatus = true;
      if (this.statusFilter === 'active') matchesStatus = mt.estActif === true;
      if (this.statusFilter === 'inactive') matchesStatus = mt.estActif === false;

      return matchesSearch && matchesTest && matchesStatus;
    });
  }






}
