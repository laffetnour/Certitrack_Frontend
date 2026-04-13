import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // ✅ IMPORTANT
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms'; // ✅ ngModel
import { ReactiveFormsModule } from '@angular/forms';
import { SessionTestService } from '../../../../core/services/session-test.service';
import { AuthService } from '../../../../core/services/auth.service'; // ✅ formGroup


export interface ModuleTenant {
  id: number;
  nom: string;
  categorie: string;
  capacite: number;
  seuilScore: number;
}
@Component({
  selector: 'app-session-test',
  standalone: true, // ✅ IMPORTANT
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './session-test.component.html',
  styleUrls: ['../ListeModuleTenant/ModuleTenant.component.css']
})
export class SessionTestComponent implements OnInit {

  //viewMode: 'modules' | 'sessions' = 'modules';

  modules: ModuleTenant[] = [];
  sessions: any[] = [];
  filteredSessions: any[] = [];

  searchTerm: string = '';
  filterEtat: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  addSessionForm!: FormGroup;
  selectedModuleId: number | null = null;

  showAddModal = false;
  showViewModal = false;
  selectedSession: any;

  today: Date = new Date();

  filteredModules: ModuleTenant[] = [];
  viewMode: 'modules' | 'sessions' | 'moduleSessions' = 'modules';
  showModuleSessionsModal = false;


  alertVisible = false;
  alertType: 'success' | 'error' | 'warning' = 'success';
  alertMessage = '';

  showDeleteModal = false;
  sessionToDeleteId: number | null = null;



  constructor(
    private sessionService: SessionTestService,private authService: AuthService,
    private fb: FormBuilder, private cdr: ChangeDetectorRef
  ) {}
  getUserId(): number {
    return this.authService.getUser()?.idUtilisateur;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadModules();
    this.loadSessions();
  }

  // ================= INIT FORM =================
  initForm() {
    this.addSessionForm = this.fb.group({
      titre: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      dureeMax: [60, [Validators.required, Validators.min(1)]],
      nbreQuestionTechnique: [0, Validators.required],
      nbreQuestionComportementale: [0, Validators.required]
    });
  }


  /*loadModules() {
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur;

    console.log(user);

    if (!userId) {
      console.error("Impossible de trouver l'ID du Tenant");
      return;
    }

    this.sessionService.getActiveModulesWithTest(userId)

      .subscribe((res: any[]) => {
        console.log(res);
        this.modules = res.map(mt => ({
          id: mt.id,
          // On accède à mt.module.nom
          nom: mt.module?.nom ?? '---',
          // ATTENTION : Dans votre JSON c'est mt.module.nomCategorie
          categorie: mt.module?.nomCategorie ?? '---',
          capacite: mt.capacite ?? 0,
          seuilScore: mt.seuilScore ?? 0
        }));
      });
    this.cdr.detectChanges();

    }*/

  loadModules() {
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur;

    if (!userId) {
      console.error("Impossible de trouver l'ID de l'utilisateur");
      return;
    }

    this.sessionService.getActiveModulesWithTest(userId)
      .subscribe({
        next: (res: any[]) => {
          console.log("Données reçues :", res);
          this.modules = res.map(mt => ({
            id: mt.id,
            nom: mt.module?.nom ?? '---',
            categorie: mt.module?.nomCategorie ?? '---',
            capacite: mt.capacite ?? 0,
            seuilScore: mt.seuilScore ?? 0
          }));
          this.filteredModules = this.modules;

          // ✅ C'EST ICI qu'il faut forcer la détection
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur lors du chargement des modules", err);
        },


      });
  }

  /*loadSessions() {
    this.sessionService.getAllSessions()
      .subscribe((res: any[]) => {
        this.sessions = res.map(s => {
          // On cherche le nom soit dans moduleTenant.module, soit dans l'objet directement
          const moduleNom = s.moduleTenant?.module?.nom || 'Module Inconnu';
          return {
            ...s,
            moduleNom: moduleNom
          };
        });

        this.applyFilters();
        this.cdr.detectChanges();
      });
  }*/

  loadSessions() {
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur;

    this.sessionService.getMySessions(userId)
      .subscribe((res: any[]) => {
        this.sessions = res.map(s => ({
          ...s,
          moduleNom: s.moduleTenant?.module?.nom || 'Module Inconnu'
        }));

        this.applyFilters();
        this.cdr.detectChanges();
      });
  }

  // ================= FILTER =================
  /*applyFilters() {

    this.filteredSessions = this.sessions
      .filter(s =>
        s.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.moduleNom.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .filter(s => !this.filterEtat || s.etat === this.filterEtat);

    this.filteredModules = this.modules.filter(m =>
      m.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.sortSessions();
  }*/


  applyFilters() {

    this.filteredSessions = this.sessions
      .filter(s => {

        const titre = s.titre?.toLowerCase() || '';
        const module = s.moduleNom?.toLowerCase() || '';
        const search = this.searchTerm.toLowerCase();

        return titre.includes(search) || module.includes(search);
      })
      .filter(s => {
        if (!this.filterEtat) return true;

        // 🔥 IMPORTANT : normalisation
        return s.etat?.toLowerCase() === this.filterEtat.toLowerCase();
      });

    this.filteredModules = this.modules.filter(m =>
      m.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.sortSessions();
  }

  // ================= SORT =================
  sortSessions() {
    this.filteredSessions.sort((a, b) => {
      const d1 = new Date(a.dateDebut).getTime();
      const d2 = new Date(b.dateDebut).getTime();
      return this.sortDirection === 'asc' ? d1 - d2 : d2 - d1;
    });
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // ================= MODULE ACTIONS =================
  openAddModal(moduleId: number) {
    this.selectedSession = null; // Important pour différencier Ajout/Modif
    this.selectedModuleId = moduleId;
    this.addSessionForm.reset({
      dureeMax: 0,
      nbreQuestionTechnique: 0,
      nbreQuestionComportementale: 0
    });

    this.showAddModal = true;
    this.cdr.detectChanges(); // 🔥 IMPORTANT

  }

  closeModal() {
    this.showAddModal = false;
    this.selectedModuleId = null;
  }

  viewSessionsByModule(moduleId: number) {

    this.sessionService.getSessionsByModule(moduleId)
      .subscribe((res: any[]) => {

        this.sessions = res.map(s => ({
          ...s,
          moduleNom: s.moduleTenant?.module?.nom || '---',
          etat: s.etat || 'enCours'
        }));

        this.applyFilters();

        // 🔥 ouvrir modal au lieu de changer de page
        this.showModuleSessionsModal = true;

        this.cdr.detectChanges();
      });
  }

  closeModuleSessionsModal() {
    this.showModuleSessionsModal = false;
  }

  // ================= SESSION CRUD =================


  /*submitSession() {

    if (this.addSessionForm.invalid || this.selectedModuleId === null) return;

    const form = this.addSessionForm.value;

    const d1 = new Date(form.dateDebut);
    const d2 = new Date(form.dateFin);
    const today = new Date();

    // ✅ règle 1
    if (d2 <= d1) {
      this.showAlert('error', "❌ Date fin doit être après date début");
      return;
    }

    if (d1 <= today) {
      this.showAlert('error', "❌ Date début doit être supérieure à aujourd'hui");
      return;
    }

    // 🔥 DIFFERENCE ADD / UPDATE
    if (this.selectedSession) {

      // ✅ UPDATE
      this.sessionService.updateSession(this.selectedSession.idSessionTest, form)
        .subscribe({
          next: () => {
            //alert('✅ Session modifiée');
            this.closeModal();
            this.loadSessions();
          },
          error: (err) => {
            alert(err.error?.message || '❌ Erreur update');
          }
        });

    } else {

      // ✅ ADD
      this.sessionService.addSession(this.selectedModuleId, form)
        .subscribe({
          next: () => {
            //alert('✅ Session ajoutée');
            this.closeModal();
            this.viewMode = 'sessions'; // Basculer pour voir le résultat
            this.loadSessions();
            this.cdr.detectChanges();
          },
          error: (err) => {
            alert(err.error?.message || '❌ Conflit ou erreur');
          }
        });

    }
  }*/

  submitSession() {

    if (this.addSessionForm.invalid || this.selectedModuleId === null) return;

    const form = this.addSessionForm.value;

    const d1 = new Date(form.dateDebut);
    const d2 = new Date(form.dateFin);
    const today = new Date();

    // ✅ règle 1
    if (d2 <= d1) {
      this.showAlert('error', "❌ Date fin doit être après date début");
      return;
    }

    // ✅ règle 2
    if (d1 <= today) {
      this.showAlert('error', "❌ Date début doit être supérieure à aujourd'hui");
      return;
    }

    // ===================== 🔥 ADD =====================
    if (!this.selectedSession) {

      // ✅ AJOUT ICI (IMPORTANT)
      if (this.isDateConflict(form)) {
        this.showAlert('warning', "⚠️ Une session existe déjà sur cette période");
        return;
      }

      //this.sessionService.addSession(this.selectedModuleId, form)
      this.sessionService.addSession(
        this.selectedModuleId!,
        this.getUserId(),
        form
      )
        .subscribe({
          next: () => {
            //this.showAlert('success', "✅ Session ajoutée");
            this.closeModal();
            this.viewMode = 'sessions';
            this.loadSessions();
          },
          error: (err) => {
            this.showAlert('error', err.error?.message || '❌ Erreur serveur');
          }
        });

    }

    // ===================== ✏️ UPDATE =====================
    else {
      // 🔥 AJOUT ICI
      if (this.isDateConflict(form)) {
        this.showAlert('warning', "⚠️ Une session existe déjà sur cette période");
        return;
      }


      //this.sessionService.updateSession(this.selectedSession.idSessionTest, form)
      this.sessionService.updateSession(
        this.selectedSession.idSessionTest,
        this.getUserId(),
        form
      )
        .subscribe({
          next: () => {
            //this.showAlert('success', "✏️ Session modifiée");
            this.closeModal();
            this.loadSessions();
          },
          error: (err) => {
            this.showAlert('error', err.error?.message || '❌ Erreur update');
          }
        });
    }
  }

  /*deleteSession(id: number) {
    if (!confirm("Supprimer cette session ?")) return;

    this.sessionService.deleteSession(id)
      .subscribe(() => {
        this.loadSessions();
      });

  }*/

  // ================= VIEW =================
  viewSession(session: any) {
    this.selectedSession = session;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
  }

  // ================= EDIT =================
  openEditModal(session: any) {
    this.selectedSession = session;
    this.selectedModuleId = session.moduleTenant?.id;

    // Fonction interne pour formater sans décalage de jour
    const formatDateForInput = (dateInput: any) => {
      if (!dateInput) return '';

      const d = new Date(dateInput);
      // On ajoute le décalage horaire local pour rester sur la même date "calendrier"
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
      return localISOTime;
    };

    const formattedSession = {
      ...session,
      dateDebut: formatDateForInput(session.dateDebut),
      dateFin: formatDateForInput(session.dateFin)
    };

    this.addSessionForm.patchValue(formattedSession);
    this.addSessionForm.markAsPristine();
    this.showAddModal = true;
  }
  // ================= RULES =================
  canEdit(session: any): boolean {
    return new Date(session.dateDebut) > this.today;
  }

  isSubmitDisabled(): boolean {

    // ❌ formulaire invalide → toujours bloqué
    if (this.addSessionForm.invalid) return true;

    // ✅ MODE UPDATE
    if (this.selectedSession) {
      return !this.addSessionForm.dirty; // 🔥 aucune modification
    }

    // ✅ MODE ADD
    return false; // valide = activé
  }


  showAlert(type: 'success' | 'error' | 'warning', message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.alertVisible = true;

    setTimeout(() => {
      this.alertVisible = false;
    }, 3000);
  }

  isDateConflict(form: any): boolean {

    const newStart = new Date(form.dateDebut).getTime();
    const newEnd = new Date(form.dateFin).getTime();

    return this.sessions.some(s => {

      const start = new Date(s.dateDebut).getTime();
      const end = new Date(s.dateFin).getTime();

      // ❌ ignorer la session en cours d’édition
      if (this.selectedSession &&
        s.idSessionTest === this.selectedSession.idSessionTest) {
        return false;
      }

      return (
        s.moduleTenant?.id === this.selectedModuleId &&
        !(newEnd < start || newStart > end)
      );
    });
  }

  openDeleteModal(id: number) {
    this.sessionToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.sessionToDeleteId = null;
  }

  confirmDelete() {
    if (!this.sessionToDeleteId) return;

    //this.sessionService.deleteSession(this.sessionToDeleteId)
    this.sessionService.deleteSession(
      this.sessionToDeleteId!,
      this.getUserId()
    )
      .subscribe({
        next: () => {
          this.loadSessions();
          this.closeDeleteModal();
          //this.showAlert('success', '✅ Session supprimée');
        },
        error: (err) => {
          this.showAlert('error', err.error?.message || '❌ Erreur suppression');
        }
      });
  }

  setViewMode(mode: 'modules' | 'sessions') {
    this.viewMode = mode;

    if (mode === 'sessions') {
      this.loadSessions(); // 🔥 FORCER CHARGEMENT
    }
  }

}
