

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

  sessions: any[] = [];
  filteredSessions: any[] = [];
  modules: any[] = [];
  filteredModules: any[] = [];

  selectedModule: any = null;
  selectedModuleId: number | null = null;
  selectedSession: any = null;

  viewMode: 'modules' | 'sessions' = 'modules';

  searchTerm = '';
  filterEtat = '';
  filterType = '';
  filterDate = '';
  today: Date = new Date();

  showAddModal = false;
  showViewModal = false;
  showDeleteModal = false;
  showModuleSessionsModal = false;
  moduleSessions: any[] = [];

  addSessionForm!: FormGroup;
  selectedModuleIds: number[] = [];
  selectionMode: 'all' | 'manual' = 'manual';
  moduleSearchTerm: string = '';
  filteredModulesForSelection: any[] = [];

  alertVisible = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

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

  initForm() {
    this.addSessionForm = this.fb.group({
      titre: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      dureeMax: [null],
      nbreQuestionTechnique: [null],
      selectionType: ['manual']
    });

    this.addSessionForm.get('selectionType')?.valueChanges.subscribe(val => {
      this.selectionMode = val;
      if (val === 'all') {
        this.selectedModuleIds = this.modules.map(m => m.id);
        // Vérifier la disponibilité pour tous les modules
        this.selectedModuleIds.forEach(id => this.checkModuleAvailability(id));
      } else {
        this.selectedModuleIds = [];
      }
    });
  }

  loadData() {
    const userId = this.getUserId();

    /*this.service.getMySessions(userId).subscribe(res => {
      this.sessions = res.map(s => ({
        ...s,
        moduleNom: s.moduleTenant?.module?.nom || '---'
      })).sort((a, b) =>
        new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
      );
      this.applyFilters();
    });*/

    this.service.getMySessions(userId).subscribe(res => {

      this.sessions = res.map(s => ({
        ...s,
        moduleNom: s.moduleTenant?.module?.nom || '---',
        etat: (s.etat || '').toString().toLowerCase().trim()
      })).sort((a, b) =>
        new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
      );

      // 🔥 IMPORTANT : forcer affichage initial complet
      this.filteredSessions = [...this.sessions];

      // appliquer filtre ensuite (optionnel mais safe)
      setTimeout(() => {
        this.applyFilters();
      });
      this.cdr.detectChanges();

    });

  this.service.getModules(userId).subscribe(res => {
    this.modules = res.map(m => ({
      ...m,
      avecTest: m.avecTest ?? false,
      nom: m.module?.nom || '---',
      categorie: m.module?.nomCategorie || '---'
    }));
    this.filteredModules = this.modules;
    this.cdr.detectChanges();
  });
  }

  applyFilters() {
    const search = this.searchTerm.toLowerCase();
    this.filteredSessions = this.sessions.filter(s => {
      const matchSearch = s.titre?.toLowerCase().includes(search) || s.moduleNom?.toLowerCase().includes(search);
      const matchEtat = !this.filterEtat || s.etat?.toLowerCase() === this.filterEtat.toLowerCase();
      const format = (d: any) => {
        if (!d) return '';
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };
      const matchDate = !this.filterDate || format(s.dateDebut) === this.filterDate || format(s.dateFin) === this.filterDate;
      return matchSearch && matchEtat && matchDate;
    });

    this.filteredModules = this.modules.filter(m => {
      const matchSearch = m.nom.toLowerCase().includes(search);
      let matchType = true;
      if (this.filterType === 'avecTest') matchType = m.avecTest === true;
      if (this.filterType === 'sansTest') matchType = m.avecTest === false;
      return matchSearch && matchType;
    });
  }

  filterModulesForForm() {
    const search = this.moduleSearchTerm.toLowerCase();
    this.filteredModulesForSelection = this.modules.filter(m =>
      m.nom.toLowerCase().includes(search) || m.categorie.toLowerCase().includes(search)
    );
  }

  checkModuleAvailability(moduleId: number) {
    const activeSession = this.sessions.find(s =>
      s.moduleTenant?.id === moduleId &&
      (s.etat === 'enCours' || s.etat === 'planifiee')
    );

    if (activeSession) {
      const moduleName = this.modules.find(m => m.id === moduleId)?.nom || 'Ce module';
      this.showAlert('warning', `⚠️ ${moduleName} est déjà lié à une session (${activeSession.etat}).`);
    }
  }

  openAddModal(moduleId?: number) {
    this.selectedSession = null;
    this.moduleSearchTerm = '';
    this.filteredModulesForSelection = [...this.modules];

    if (moduleId) {
      this.selectedModuleIds = [moduleId];
      this.selectionMode = 'manual';
      this.checkModuleAvailability(moduleId);
    } else {
      this.selectedModuleIds = [];
      this.selectionMode = 'manual';
    }

    this.addSessionForm.reset({
      selectionType: this.selectionMode,
      dureeMax: null,
      nbreQuestionTechnique: null
    });
    this.showAddModal = true;
  }


openEditModal(session: any) {
  if (!this.canEdit(session)) {
    this.showAlert('warning', '⚠️ Cette session ne peut plus être modifiée.');
    return;
  }

  this.selectedSession = session;
  this.moduleSearchTerm = '';
  this.filteredModulesForSelection = [...this.modules];

  this.addSessionForm.patchValue({
    titre: session.titre,
    dateDebut: this.formatDate(session.dateDebut),
    dateFin: this.formatDate(session.dateFin),
    dureeMax: session.dureeMax,
    nbreQuestionTechnique: session.nbreQuestionTechnique,
    selectionType: 'manual' // Obligatoire pour le validateur du formulaire
  });

  // Extraction propre des IDs pour les checkboxes
  if (session.modulesTenants && Array.isArray(session.modulesTenants)) {
    this.selectedModuleIds = session.modulesTenants.map((m: any) => m.id);
  } else if (session.moduleTenant) {
    this.selectedModuleIds = [session.moduleTenant.id];
  } else {
    this.selectedModuleIds = [];
  }

  this.showAddModal = true;
  this.addSessionForm.markAsPristine();
  this.cdr.detectChanges();
}
  submitSession() {
    if (this.addSessionForm.invalid || this.selectedModuleIds.length === 0) {
      this.showAlert('error', '❌ Formulaire invalide ou aucun module sélectionné.');
      return;
    }

    const formVal = this.addSessionForm.value;
    const userId = this.getUserId();

    // --- VALIDATION DATE DÉBUT > AUJOURD'HUI ---
    const dateDebut = new Date(formVal.dateDebut);
    const dateFin = new Date(formVal.dateFin);
    const todayNow = new Date();
    todayNow.setHours(0, 0, 0, 0); // Comparaison à minuit

    if (dateDebut <= todayNow) {
      this.showAlert('error', "❌ La date de début doit être supérieure ou égale à la date d'aujourd'hui.");
      return;
    }

    if (dateFin <= dateDebut) {
      this.showAlert('error', '❌ La date de fin doit être après la date de début.');
      return;
    }

    if (this.isDateConflict(formVal)) {
      this.showAlert('warning', '⚠️ Chevauchement temporel avec une session existante pour un module sélectionné.');
      return;
    }

    if (!this.selectedSession) {
      this.service.addSession(this.selectedModuleIds, userId, {
      ...formVal,
      moduleIds: this.selectedModuleIds
      }).subscribe({
        next: () => this.handleSuccess('Session(s) ajoutée(s) !'),
        error: () => this.showAlert('error', "Erreur lors de l'ajout.")
      });
    } else {
      const rawValues = this.addSessionForm.value;

        // CRÉATION DU PAYLOAD PROPRE
        const payload = {
            nomSession: formVal.titre, // mapping vers DTO
            dateDebutInsc: formVal.dateDebut,
            dateFinInsc: formVal.dateFin,
            dureeMax: formVal.dureeMax,
            nbreQuestionTechnique: formVal.nbreQuestionTechnique,
            modulesTenantsIds: this.selectedModuleIds // Ex: [27, 28]
          };

      this.service.updateSession(this.selectedSession.id, userId, payload).subscribe({
            next: () => this.handleSuccess('Session modifiée !'),
            error: (err) => {
              console.error("Erreur Backend :", err);
              this.showAlert('error', 'Erreur lors de la modification.');
            }
          });
    }
  }

  handleSuccess(msg: string) {
    this.closeModal();
    this.loadData();
    this.viewMode = 'sessions';
    this.showAlert('success', '✅ ' + msg);
  }

  isDateConflict(form: any): boolean {
    const newStart = new Date(form.dateDebut).getTime();
    const newEnd = new Date(form.dateFin).getTime();

    return this.sessions.some(s => {
      if (this.selectedSession && s.id === this.selectedSession.id) return false;
      const start = new Date(s.dateDebut).getTime();
      const end = new Date(s.dateFin).getTime();

      return this.selectedModuleIds.includes(s.moduleTenant?.id) && !(newEnd < start || newStart > end);
    });
  }

  // ================= SUPPRESSION / VUE =================
  openDeleteModal(s: any) {
    this.selectedSession = s;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.service.deleteSession(this.selectedSession.id, this.getUserId()).subscribe(() => {
      this.showDeleteModal = false;
      this.loadData();
      this.showAlert('success', '🗑 Session supprimée');
    });
  }

  viewSession(s: any) {
    this.selectedSession = s;
    this.showViewModal = true;
  }

  viewSessionsByModule(moduleId: number) {
    this.service.getSessionsByModule(moduleId).subscribe({
      next: (res) => {
        this.moduleSessions = res.map(s => ({ ...s, moduleNom: s.moduleTenant?.module?.nom || '---' }));
        this.showModuleSessionsModal = true;
        this.cdr.detectChanges();
      }
    });
  }

  closeModal() {
    this.showAddModal = false;
    this.selectedSession = null;
    this.selectedModuleIds = [];
  }


toggleModuleSelection(moduleId: number) {
  const index = this.selectedModuleIds.indexOf(moduleId);

  if (index > -1) {
    this.selectedModuleIds.splice(index, 1);
  } else {
    this.selectedModuleIds.push(moduleId);
    this.checkModuleAvailability(moduleId);
  }

  this.addSessionForm.markAsDirty();
}

  setViewMode(mode: 'modules' | 'sessions') {
    this.viewMode = mode;
    this.searchTerm = '';
    this.applyFilters();
  }

  isSubmitDisabled(): boolean {
    return this.addSessionForm.invalid || (this.selectedSession && !this.addSessionForm.dirty);
  }

  formatDate(dateInput: any): string {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  }

  canEdit(s: any): boolean {
    if (!s || !s.etat) return true;
    const etat = s.etat.toLowerCase();
    return etat === 'planifiee';
  }

  showAlert(type: 'success' | 'error' | 'warning', msg: string) {
    this.alertType = type;
    this.alertMessage = msg;
    this.alertVisible = true;
    setTimeout(() => this.alertVisible = false, 3000);
  }

  closeModuleSessionsModal() {
    this.showModuleSessionsModal = false;
  }
}
