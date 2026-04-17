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
    //seuilScore: null
    seuilScore: null as number | null,
    capacite: null as number | null
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


//8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
  selectedModuleForSession: any = null;
  showChoiceModal = false;
  showSessionFormModal = false;

  // Formulaire de session
  sessionForm = {
    titre: '',
    dateDebut: '',
    dateFin: '',
    dureeMax: null,
    nbreQuestionTechnique: null
  };

  sessionChoice: boolean = false;

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  isModuleLocked: boolean = false;
  isLocked: boolean = false;

  selectedModuleId: number | null = null;
  selectedSession: any = null;





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
        this.applyFilters();
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
 /* onRemoveModule(moduleTenantId: number): void {
    if (confirm('Voulez-vous vraiment retirer ce module de votre catalogue ?')) {
      this.moduleTenantService.deleteModuleTenant(moduleTenantId).subscribe({
        next: () => {
          // Mise à jour locale de la liste pour éviter un rechargement complet
          this.myModules = this.myModules.filter(m => m.id !== moduleTenantId);
          //alert('Module retiré avec succès.');
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur suppression', err);

          const msg =
            err?.error?.message ||
            err?.error ||
            "Suppression impossible.";

          this.showAlert('error', msg);
          this.cdr.detectChanges();
        }
      });
    }
  }*/

  onRemoveModule(moduleTenantId: number): void {
    // On peut ajouter une petite vérification visuelle avant même d'appeler le serveur
    const module = this.myModules.find(m => m.id === moduleTenantId);
    if (module && module.sessions && module.sessions.length > 0) {
      this.showAlert('warning', 'Suppression impossible : Ce module possède un historique de sessions " +\n' +
        '                            "(planifiées, en cours ou clôturées). Vous ne pouvez pas le supprimer.');
      return;
    }

    if (confirm('Voulez-vous vraiment retirer ce module vide de votre catalogue ?')) {
      this.moduleTenantService.deleteModuleTenant(moduleTenantId).subscribe({
        next: () => {
          this.myModules = this.myModules.filter(m => m.id !== moduleTenantId);
          this.applyFilters();
          this.cdr.detectChanges();
          this.showAlert('success', '✅ Module supprimé avec succès.');
        },
        error: (err) => {
          // Affiche le message : "Suppression impossible : Ce module possède un historique..."
          const msg = err.error || "Erreur lors de la suppression.";
          this.showAlert('error', msg);
          this.cdr.detectChanges();
        }
      });
    }
  }



  toggleAllMyModules(event: any): void {
    if (event.target.checked) {
      // On n'ajoute que les modules visibles dans le filtre
      this.filteredMyModules.forEach(mt => this.selectedMyModulesIds.add(mt.id));
    } else {
      // On ne retire que les modules visibles
      this.filteredMyModules.forEach(mt => this.selectedMyModulesIds.delete(mt.id));
    }
  }


  isAllMyModulesSelected(): boolean {
    return this.filteredMyModules.length > 0 &&
      this.filteredMyModules.every(m => this.selectedMyModulesIds.has(m.id));
  }





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

  /*openTestForm(mt: any) {
    this.selectedModuleForTest = mt;

    this.testForm = {
      avecTest: mt.avecTest,
      seuilScore: mt.seuilScore,
      capacite: mt.capacite // On initialise avec la valeur actuelle//88888888888888888888888888888888888888888888888888888

    };
  }*/



  openTestForm(mt: any) {
    this.selectedModuleForTest = mt;

    // On verrouille si le module a des sessions qui ne sont pas clôturées
    // Adapté selon vos noms de variables (enCours, planifiee, etc.)
    this.isLocked = mt.sessions?.some((s: any) => s.etat !== 'cloturee');

    this.testForm = {
      avecTest: mt.avecTest,
      seuilScore: mt.seuilScore,
      capacite: mt.capacite
    };
  }







  /*confirmTest() {
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
  }*/
  //888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
  confirmTest() {
    // 1. On récupère une référence solide
    const mt = this.selectedModuleForTest;
    if (!mt) return;

    // 2. On s'assure que les valeurs numériques sont bien des nombres (et pas des strings)
    const avecTestVal = String(this.testForm.avecTest) === 'true'; // Conversion de sécurité
    const seuil = this.testForm.seuilScore ? Number(this.testForm.seuilScore) : null;
    const capa = this.testForm.capacite ? Number(this.testForm.capacite) : null;

    this.moduleTenantService.configTest(
      mt.id,
      avecTestVal,
      seuil,
      capa
    ).subscribe({
      next: (updatedMt: any) => {
        // 3. Mise à jour de la liste locale
        const index = this.myModules.findIndex(m => m.id === updatedMt.id);
        if (index !== -1) {
          this.myModules[index] = { ...updatedMt }; // On crée une copie propre
          this.myModules = [...this.myModules];
          this.applyFilters();
        }

        // 4. On ferme proprement
        this.selectedModuleForTest = null;
        this.cdr.detectChanges(); // On force le rafraîchissement

        this.showAlert('success', '✅ Configuration enregistrée !');
      },
      error: (err) => {
        console.error("Erreur", err);
        this.showAlert('error', "Erreur lors de la sauvegarde.");
      }
    });
  }

  toggleModule(mt: any) {
    //8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    const hasActiveSession = mt.sessions?.some((s: any) => s.etat === 'enCours');

    if (hasActiveSession) {
      this.showAlert('warning', '⚠️ Impossible de modifier : session en cours');
      return;
    }


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

  //88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888






  openAddSessionFromConfig() {
    const mt = this.selectedModuleForTest;

    if (!mt.estActif) {
      alert("⚠️ Tu dois activer le module !");
      return;
    }

    this.selectedModuleForTest = null;
    this.selectedModuleForSession = mt;

    this.sessionChoice = this.testForm.avecTest;

    this.showSessionFormModal = true;
  }

  submitSession() {
    const mt = this.selectedModuleForSession;

    if (!mt) return;

    // ✅ MODULE ACTIF
    if (!mt.estActif) {
      this.showAlert('warning', '⚠️ Tu dois activer le module !');
      return;
    }

    const debut = new Date(this.sessionForm.dateDebut);
    const fin = new Date(this.sessionForm.dateFin);
    const today = new Date();

    // ✅ DATE FIN > DATE DEBUT
    if (fin <= debut) {
      this.showAlert('error', '❌ La date de fin doit être strictement après la date de début.');
      return;
    }

    // ✅ DATE FUTURE
    if (debut < today) {
      this.showAlert('error', '❌ Date début doit être supérieure à aujourd\'hui.');
      return;
    }

    if (this.isDateConflict(this.sessionForm)) {
      this.showAlert('warning',
        '⚠️ Cette période chevauche une session existante pour ce module.'
      );
      return;
    }

    // ✅ TEST OBLIGATOIRE
    if (this.sessionChoice) {
      if (!this.sessionForm.dureeMax || !this.sessionForm.nbreQuestionTechnique) {
        this.showAlert('error', '❌ Champs test obligatoires');
        return;
      }
    }

    const user = this.authService.getUser();

    this.moduleTenantService.addSession(
      mt.id,
      user.idUtilisateur,
      this.sessionForm
    ).subscribe({
      next: () => {
        this.showAlert('success', '✅ Session ajoutée !');
        this.showSessionFormModal = false;
        this.loadMyCatalogue();
        this.cdr.detectChanges();
      },
      error: err => {
        this.showAlert('error', err.error || 'Erreur serveur');
      }
    });
  }

  isDateConflict(form: any): boolean {

    const newStart = new Date(form.dateDebut).getTime();
    const newEnd = new Date(form.dateFin).getTime();

    const module = this.selectedModuleForSession;

    if (!module?.sessions) return false;

    return module.sessions.some((s: any) => {

      const start = new Date(s.dateDebut).getTime();
      const end = new Date(s.dateFin).getTime();

      return !(newEnd < start || newStart > end);
    });
  }



  showAlert(type: 'success' | 'error' | 'warning', msg: string) {
    this.alertType = type;
    this.alertMessage = msg;
    this.alertVisible = true;

    setTimeout(() => {
      this.alertVisible = false;
    }, 3000);
  }




  // Ajoutez cette méthode dans votre classe ListeModuleTenantComponent

  hasActiveSession(mt: any): boolean {
    if (!mt?.sessions || mt.sessions.length === 0) return false;

    return mt.sessions.some((s: any) => {
      // Si s.etat est null ou undefined, on ne peut pas considérer la session comme active
      if (!s.etat) return false;

      const etatNormalise = s.etat.toString().toLowerCase();

      // On vérifie les deux orthographes possibles
      return etatNormalise === 'encours' || etatNormalise === 'en_cours';
    });
  }




// Modifiez votre méthode onAddSessionClick pour utiliser mt
  onAddSessionClick(mt: any) {
    if (!mt.estActif) {
      this.showAlert('warning', "Module désactivé : vous devez l'activer pour ajouter une session.");
      return;
    }

    this.selectedModuleForSession = mt;
    this.sessionChoice = mt.avecTest;
    this.showSessionFormModal = true;
  }


}
