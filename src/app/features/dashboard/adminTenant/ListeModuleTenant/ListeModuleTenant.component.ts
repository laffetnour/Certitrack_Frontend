import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import {ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionInscService } from '../../../../core/services/session-insc.service';

import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

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
  /*sessionForm = {
    titre: '',
    dateDebut: '',
    dateFin: '',
    dureeMax: null,
    nbreQuestionTechnique: null
  };*/

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
    private service: SessionInscService,
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




  /*onRemoveModule(moduleTenantId: number): void {
    const module = this.myModules.find(m => m.id === moduleTenantId);

    // Vérification préventive côté Front
    if (module && module.sessions?.some((s: any) => s.etat !== 'cloturee')) {
      this.showAlert('warning', 'Suppression impossible : Ce module possède des sessions actives ou planifiées.');
      return;
    }

    if (confirm('Voulez-vous vraiment retirer ce module de votre catalogue ?')) {
      this.moduleTenantService.deleteModuleTenant(moduleTenantId).subscribe({
        next: () => {
          this.myModules = this.myModules.filter(m => m.id !== moduleTenantId);
          this.applyFilters();
          this.showAlert('success', '✅ Module supprimé avec succès.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          // On récupère le message du throw new RuntimeException du Java
          const msg = typeof err.error === 'string' ? err.error : (err.error?.message || "Erreur lors de la suppression.");
          this.showAlert('error', msg);
          this.cdr.detectChanges();
        }
      });
    }
  }*/

  onRemoveModule(moduleTenantId: number): void {
    const module = this.myModules.find(m => m.id === moduleTenantId);

    // Vérification stricte : si le tableau de sessions contient au moins un élément
    if (module && module.sessions && module.sessions.length > 0) {
      this.showAlert('warning', '⚠️ Suppression impossible : Ce module possède un historique de sessions(planifiée , en cours ou cloturée).');
      return;
    }

    if (confirm('Voulez-vous vraiment retirer ce module de votre catalogue ?')) {
      this.moduleTenantService.deleteModuleTenant(moduleTenantId).subscribe({
        next: () => {
          this.myModules = this.myModules.filter(m => m.id !== moduleTenantId);
          this.applyFilters();
          //this.showAlert('success', '✅ Module supprimé.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          const msg = typeof err.error === 'string' ? err.error : (err.error?.message || "Erreur serveur.");
          this.showAlert('error', msg);
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
    if (mt.estActif) {
      const hasBlockedSession = mt.sessions?.some((s: any) =>
        s.etat === 'enCours' || s.etat === 'planifiee'
      );

      if (hasBlockedSession) {
        // ✅ CHANGÉ EN WARNING
        this.showAlert('warning', '⚠️ Désactivation impossible : ce module contient des sessions en cours ou planifiées.');
        return;
      }
    }

    this.moduleTenantService.toggleModule(mt.id).subscribe({
      next: (updatedMt: any) => {
        const index = this.myModules.findIndex(m => m.id === updatedMt.id);
        if (index !== -1) {
          this.myModules[index] = { ...updatedMt };
          this.applyFilters();
          //this.showAlert('success', `Le module est maintenant ${updatedMt.estActif ? 'actif' : 'inactif'}.`);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        let msg = "Une erreur est survenue";
        if (typeof err.error === 'string') msg = err.error;
        else if (err.error?.message) msg = err.error.message;

        // ✅ CHANGÉ EN WARNING (Car ce sont souvent des blocages métiers : capacité, sessions...)
        this.showAlert('warning', msg);
        this.cdr.detectChanges();
      }
    });
  }


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
      next: (res: any) => {

        // ✅ MODIFIER SEULEMENT CEUX ACCEPTÉS PAR BACKEND
        this.myModules = this.myModules.map(m => {
          if (res.successIds.includes(m.id)) {
            return { ...m, estActif: status };
          }
          return m;
        });

        // ✅ vider sélection
        this.selectedMyModulesIds.clear();

        // ✅ refresh
        this.applyFilters();

        // ⚠️ afficher erreurs
        if (res.errors && res.errors.length > 0) {
          this.showAlert('warning', res.errors.join('\n'));
        } else {
          //this.showAlert('success', 'Opération réussie');
        }

        this.cdr.detectChanges();
      },

      error: () => {
        this.showAlert('error', 'Erreur serveur');
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

  /*submitSession() {
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
  }*/

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

  onBulkRemove(): void {

    if (this.selectedMyModulesIds.size === 0) {
      this.showAlert('warning', '⚠️ Aucun module sélectionné');
      return;
    }

    if (!confirm(`Voulez-vous vraiment retirer ces ${this.selectedMyModulesIds.size} modules ?`)) {
      return;
    }

    const ids = Array.from(this.selectedMyModulesIds);

    this.moduleTenantService.bulkDelete(ids).subscribe({
      next: (res: any) => {

        // ✅ supprimer seulement les réussis
        this.myModules = this.myModules.filter(m => !res.successIds.includes(m.id));

        // ✅ vider sélection
        this.selectedMyModulesIds.clear();

        // ✅ refresh
        this.applyFilters();

        // ⚠️ erreurs partielles
        if (res.errors && res.errors.length > 0) {
          this.showAlert('warning', res.errors.join('\n'));
        } else {
          this.showAlert('success', 'Suppression réussie');
        }

        this.cdr.detectChanges();
      },

      error: () => {
        this.showAlert('error', 'Erreur serveur');
      }
    });
  }

// Initialisez l'objet sessionForm pour éviter les erreurs undefined
sessionForm = {
  titre: '',
  dateDebut: '',
  dateFin: '',
  dureeMax: null as number | null,
  nbreQuestionTechnique: null as number | null
};

// Nouvelle méthode pour l'action groupée
onBulkAddSession() {
  if (this.selectedMyModulesIds.size === 0) {
    this.showAlert('warning', '⚠️ Veuillez sélectionner au moins un module.');
    return;
  }

  // Vérifier si parmi les sélectionnés il y a des modules inactifs
  const selectedModules = this.myModules.filter(m => this.selectedMyModulesIds.has(m.id));
  const hasInactive = selectedModules.some(m => !m.estActif);

  if (hasInactive) {
    this.showAlert('warning', '⚠️ Certains modules sélectionnés sont inactifs. Activez-les d\'abord.');
    return;
  }

  // Réinitialiser le formulaire
  this.sessionForm = {
    titre: '',
    dateDebut: '',
    dateFin: '',
    dureeMax: null,
    nbreQuestionTechnique: null
  };

  // On active les champs techniques si AU MOINS un des modules sélectionnés a "avecTest"
  this.sessionChoice = selectedModules.some(m => m.avecTest);

  this.showSessionFormModal = true;
}

submitSession() {
  const ids = Array.from(this.selectedMyModulesIds);
  const user = this.authService.getUser();

  // 1. Validations de base
  if (!this.sessionForm.titre || !this.sessionForm.dateDebut || !this.sessionForm.dateFin) {
    this.showAlert('error', '❌ Veuillez remplir tous les champs obligatoires.');
    return;
  }

  const debut = new Date(this.sessionForm.dateDebut);
  const fin = new Date(this.sessionForm.dateFin);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (debut <= today) {
    this.showAlert('error', "❌ La date de début doit être strictement supérieure à aujourd'hui.");
    return;
  }

  if (fin <= debut) {
    this.showAlert('error', '❌ La date de fin doit être après la date de début.');
    return;
  }

  // --- CORRECTION TS2345 ---
  // On crée une copie de l'objet pour transformer les 'null' en 'undefined'
  // pour correspondre exactement à l'interface 'Session' attendue par le service
  const sessionPayload = {
    ...this.sessionForm,
    dureeMax: this.sessionForm.dureeMax ?? undefined,
    nbreQuestionTechnique: this.sessionForm.nbreQuestionTechnique ?? undefined
  };

  // 4. Appel au service avec l'objet nettoyé
  this.service.addSession(ids, user.idUtilisateur, sessionPayload).subscribe({
    next: () => {
      this.showAlert('success', '✅ Sessions créées avec succès !');
      this.showSessionFormModal = false;
      this.selectedMyModulesIds.clear();
      this.loadMyCatalogue();
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Erreur lors de la création');
      this.showAlert('error', '❌ ' + msg);
    }
  });
}
}
