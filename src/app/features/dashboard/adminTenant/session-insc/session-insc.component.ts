import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SessionInscService } from '../../../../core/services/session-insc.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-session-insc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './session-insc.component.html',
  styleUrls: ['../ListeModuleTenant/ModuleTenant.component.css']
})
export class SessionInscComponent implements OnInit {

  // ================= DATA =================
  sessions: any[] = [];
  filteredSessions: any[] = [];

  modules: any[] = [];
  filteredModules: any[] = [];

  selectedModule: any = null;
  selectedModuleId: number | null = null;

  selectedSession: any = null;

  viewMode: 'modules' | 'sessions' = 'modules';

  // ================= UI =================
  searchTerm = '';
  filterEtat = '';

  showAddModal = false;
  showViewModal = false;
  showDeleteModal = false;

  // ================= FORM =================
  addSessionForm!: FormGroup;

  // ================= ALERT =================
  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  moduleSessions: any[] = [];
  showModuleSessionsModal = false;

  today: Date = new Date();
  filterType = '';

  constructor(
    private service: SessionInscService,
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  getUserId(): number {
    return this.auth.getUser()?.idUtilisateur;
  }

  // ================= INIT FORM =================
  initForm() {
    this.addSessionForm = this.fb.group({
      titre: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      dureeMax: [null],
      nbreQuestionTechnique: [null]
    });
  }

  // ================= LOAD DATA =================
  loadData() {
    const userId = this.getUserId();

    // 🔵 sessions
    this.service.getMySessions(userId).subscribe(res => {
      this.sessions = res.map(s => ({
        ...s,
        moduleNom: s.moduleTenant?.module?.nom || '---'
      }));
      this.cdr.detectChanges();
      this.applyFilters();
    });

    // 🟢 modules actifs
    this.service.getModules(userId).subscribe(res => {
      this.modules = res.map(m => ({
        id: m.id,
        nom: m.module?.nom || '---',
        categorie: m.module?.nomCategorie || '---', // 🔥 CORRIGÉ ICI
        capacite: m.capacite,
        seuilScore: m.seuilScore,
        avecTest: m.avecTest
      }));

      this.filteredModules = this.modules;

      this.cdr.detectChanges(); // ✅ IMPORTANT
    });
  }

  // ================= FILTER =================
  applyFilters() {

    const search = this.searchTerm.toLowerCase();

    this.filteredSessions = this.sessions.filter(s => {

      const matchSearch =
        s.titre?.toLowerCase().includes(search) ||
        s.moduleNom?.toLowerCase().includes(search);

      const matchEtat =
        !this.filterEtat ||
        s.etat?.toLowerCase() === this.filterEtat.toLowerCase();

      return matchSearch && matchEtat;
    });

    /*this.filteredModules = this.modules.filter(m =>
      m.nom.toLowerCase().includes(search)
    );*/
    this.filteredModules = this.modules.filter(m => {
      const matchSearch = m.nom.toLowerCase().includes(search);

      // Logique pour le type de test
      let matchType = true;
      if (this.filterType === 'avecTest') matchType = m.avecTest === true;
      if (this.filterType === 'sansTest') matchType = m.avecTest === false;

      return matchSearch && matchType;
    });
  }

  // ================= MODULE ACTIONS =================
  openAddModal(moduleId: number) {

    this.selectedSession = null;
    this.selectedModuleId = moduleId;

    this.selectedModule = this.modules.find(m => m.id === moduleId);

    console.log("MODULE SELECTED =", this.selectedModule); // DEBUG

    this.addSessionForm.reset({
      dureeMax: null,
      nbreQuestionTechnique: null
    });

    this.showAddModal = true;
  }

  /*viewSessionsByModule(moduleId: number) {

    this.service.getSessionsByModule(moduleId).subscribe(res => {

      this.sessions = res.map(s => ({
        ...s,
        moduleNom: s.moduleTenant?.module?.nom || '---'
      }));

      this.viewMode = 'sessions';
      this.applyFilters();
    });
  }*/

  viewSessionsByModule(moduleId: number) {
    this.selectedModule = this.modules.find(m => m.id === moduleId);
    this.moduleSessions = []; // Reset le tableau avant l'appel

    this.service.getSessionsByModule(moduleId).subscribe({
      next: (res) => {
        // On remplit les données
        this.moduleSessions = res.map(s => ({
          ...s,
          moduleNom: s.moduleTenant?.module?.nom || '---'
        }));

        // 🔥 IMPORTANT : On ouvre le modal SEULEMENT après avoir reçu les données
        this.showModuleSessionsModal = true;

        // 🔥 FORCE la mise à jour de la vue immédiatement
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showAlert('error', 'Erreur lors de la récupération des sessions');
      }
    });
  }

  // ================= SUBMIT =================
  /*submitSession() {

    if (this.addSessionForm.invalid || !this.selectedModuleId) return;

    const form = this.addSessionForm.value;
    const userId = this.getUserId();

    const d1 = new Date(form.dateDebut);
    const d2 = new Date(form.dateFin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ DATE FIN > DATE DEBUT
    if (d2 <= d1) {
      this.showAlert('error', '❌ Date fin doit être après date début');
      return;
    }

    // ✅ DATE DEBUT > AUJOURD’HUI
    if (d1 <= today) {
      this.showAlert('error', '❌ Date début doit être dans le futur');
      return;
    }

    // ✅ CONFLIT
    if (this.isDateConflict(form)) {
      this.showAlert('warning', '⚠️ Conflit avec une session existante');
      return;
    }

    // ✅ SI MODULE SANS TEST → vider champs
    if (!this.selectedModule?.avecTest) {
      form.dureeMax = null;
      form.nbreQuestionTechnique = null;
    }

    // ================= ADD =================
    if (!this.selectedSession) {

      this.service.addSession(this.selectedModuleId, userId, form)
        .subscribe({
          next: () => {
            this.closeModal();
            this.viewMode = 'sessions';
            this.loadData();
            this.showAlert('success', '✅ Session ajoutée');
          },
          error: (err) => {
            this.showAlert('error', err.error?.message || 'Erreur serveur');
          }
        });
    }

    // ================= UPDATE =================
    else {

      this.service.updateSession(this.selectedSession.id, userId, form)
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadData();
            this.showAlert('success', '✏️ Session modifiée');
          },
          error: (err) => {
            this.showAlert('error', err.error?.message || 'Erreur update');
          }
        });
    }
  }*/

  // DANS session-insc.component.ts

  submitSession() {
    // 1. Vérification si le formulaire est valide
    if (this.addSessionForm.invalid || !this.selectedModuleId) {
      this.showAlert('error', '❌ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const form = this.addSessionForm.value;
    const userId = this.getUserId();

    // Conversion des dates pour comparaison
    const d1 = new Date(form.dateDebut);
    const d2 = new Date(form.dateFin);
    const today = new Date();
    //today.setHours(0, 0, 0, 0); // Reset l'heure pour comparer uniquement le jour

    // ✅ TEST 1 : DATE FIN > DATE DEBUT
    if (d2 <= d1) {
      console.log("Erreur: date fin <= date debut"); // Debug
      this.showAlert('error', '❌ La date de fin doit être strictement après la date de début.');
      return;
    }

    // ✅ TEST 2 : DATE DEBUT >= AUJOURD'HUI
    if (d1 < today) {
      console.log("Erreur: date debut dans le passé"); // Debug
      this.showAlert('error', '❌ Date début doit être supérieure à aujourd\'hui.');
      return;
    }

    // ✅ TEST 3 : CONFLIT DE DATES
    if (this.isDateConflict(form)) {
      this.showAlert('warning', '⚠️ Cette période chevauche une session existante pour ce module.');
      return;
    }

    // Logique d'envoi (Add ou Update)
    if (!this.selectedSession) {
      this.service.addSession(this.selectedModuleId, userId, form).subscribe({
        next: () => {
          this.closeModal();
          this.viewMode = 'sessions';
          this.loadData();
          this.showAlert('success', '✅ Session ajoutée avec succès !');
        },
        error: (err) => this.showAlert('error', 'Erreur lors de l\'ajout.')
      });
    } else {
      this.service.updateSession(this.selectedSession.id, userId, form).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          this.showAlert('success', '✏️ Session modifiée avec succès !');
        },
        error: (err) => this.showAlert('error', 'Erreur lors de la modification.')
      });
    }
  }

  // ================= CONFLICT =================
  isDateConflict(form: any): boolean {

    const newStart = new Date(form.dateDebut).getTime();
    const newEnd = new Date(form.dateFin).getTime();

    return this.sessions.some(s => {

      const start = new Date(s.dateDebut).getTime();
      const end = new Date(s.dateFin).getTime();

      if (this.selectedSession && s.id === this.selectedSession.id) {
        return false;
      }

      return (
        s.moduleTenant?.id === this.selectedModuleId &&
        !(newEnd < start || newStart > end)
      );
    });
  }

  // ================= DELETE =================
  openDeleteModal(s: any) {
    this.selectedSession = s;
    this.showDeleteModal = true;
  }

  confirmDelete() {

    const userId = this.getUserId();

    this.service.deleteSession(this.selectedSession.id, userId)
      .subscribe(() => {
        this.showDeleteModal = false;
        this.loadData();
        this.showAlert('success', '🗑 Session supprimée');
      });
  }

  // ================= VIEW =================
  viewSession(s: any) {
    this.selectedSession = s;
    this.showViewModal = true;
  }

  // ================= UTILS =================
  closeModal() {
    this.showAddModal = false;
    this.selectedModuleId = null;
    this.selectedSession = null;
  }

  closeViewModal() {
    this.showViewModal = false;
  }

  /*setViewMode(mode: 'modules' | 'sessions') {
    this.viewMode = mode;

    if (mode === 'sessions') {
      this.loadData();
    }
  }*/

  setViewMode(mode: 'modules' | 'sessions') {
    this.viewMode = mode;
    this.searchTerm = '';
    this.filterEtat = '';
    this.filterType = ''; // Réinitialise le filtre type
    this.applyFilters();

    if (mode === 'sessions') {
      this.loadData();
    }
  }

  canEdit(s: any): boolean {
    return s.etat !== 'cloturee';
  }

  /*isSubmitDisabled(): boolean {
    return this.addSessionForm.invalid;
  }*/
  // Remplacez l'ancienne version par celle-ci
  isSubmitDisabled(): boolean {
    // 1. Si les validateurs (Validators.required) ne sont pas respectés, on bloque
    if (this.addSessionForm.invalid) {
      return true;
    }

    // 2. Si on est en mode MODIFICATION (selectedSession existe)
    if (this.selectedSession) {
      // On bloque le bouton SI le formulaire n'est PAS "sale" (donc aucune modif faite)
      return !this.addSessionForm.dirty;
    }

    // 3. En mode AJOUT, on ne bloque pas si le formulaire est valide
    return false;
  }

  // ================= ALERT =================
  showAlert(type: 'success' | 'error' | 'warning', msg: string) {
    this.alertType = type;
    this.alertMessage = msg;
    this.alertVisible = true;

    setTimeout(() => {
      this.alertVisible = false;
    }, 3000);
  }

  // ================= EDIT =================
  /*openEditModal(session: any) {

    this.selectedSession = session;
    this.selectedModuleId = session.moduleTenant?.id;

    this.selectedModule = this.modules.find(m => m.id === this.selectedModuleId);

    // remplir le formulaire avec les données existantes
    this.addSessionForm.patchValue({
      titre: session.titre,
      dateDebut: this.formatDate(session.dateDebut),
      dateFin: this.formatDate(session.dateFin),
      dureeMax: session.dureeMax,
      nbreQuestionTechnique: session.nbreQuestionTechnique
    });

    this.showAddModal = true;
  }*/
  openEditModal(session: any) {
    this.selectedSession = session;
    this.selectedModuleId = session.moduleTenant?.id;
    this.selectedModule = this.modules.find(m => m.id === this.selectedModuleId);

    // On patch avec les dates corrigées
    this.addSessionForm.patchValue({
      titre: session.titre,
      dateDebut: this.formatDate(session.dateDebut),
      dateFin: this.formatDate(session.dateFin),
      dureeMax: session.dureeMax,
      nbreQuestionTechnique: session.nbreQuestionTechnique
    });

    this.addSessionForm.markAsPristine(); // Marque le formulaire comme "non touché"
    this.showAddModal = true;
    this.cdr.detectChanges(); // Force le rendu du modal avec les données
  }

  formatDate(dateInput: any): string {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    // On ajuste le décalage horaire local (ex: Tunisie +1h) pour éviter le -1 jour
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  }

  closeModuleSessionsModal() {
    this.showModuleSessionsModal = false;
  }
}
