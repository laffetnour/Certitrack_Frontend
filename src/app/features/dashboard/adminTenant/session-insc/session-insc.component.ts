import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionInscService } from '../../../../core/services/session-insc.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleTenantService} from '../../../../core/services/ModuleTenant.service';

@Component({
  selector: 'app-session-insc',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule
    ],
  templateUrl: './session-insc.component.html',
  styleUrls: ['../ListeModuleTenant/ModuleTenant.component.css']// Réutilise ton CSS modern-table
})
export class SessionInscComponent implements OnInit {
  sessions: any[] = [];
  activeModules: any[] = [];
  filteredModulesForSelect: any[] = [];

  searchTermModule: string = '';
  selectedModuleName: string = '';
  showModuleResults: boolean = false;



  filteredSessions: any[] = [];
  addSessionForm: FormGroup;

    showAddModal = false;
    showDeleteModal = false;
    alertVisible = false;
    selectedSession: any = null;
    idToDelete: number | null = null;
    alertType: 'success' | 'error' | 'warning' = 'success';
    alertMessage = '';

  constructor(private fb: FormBuilder, private service: SessionInscService,
    private authService: AuthService,
    private moduleTenantService: ModuleTenantService,
    private cdr: ChangeDetectorRef
    ) {
    this.addSessionForm = this.fb.group({
      nomSession: ['', Validators.required],
      dateDebutInsc: ['', Validators.required],
      dateFinInsc: ['', Validators.required],
      moduleTenantId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSessions();
  }

showAlert(type: 'success' | 'error' | 'warning', msg: string) {
  this.alertType = type;
  this.alertMessage = msg;
  this.alertVisible = true;

  // On force Angular à rafraîchir la vue
  this.cdr.detectChanges();

  // L'alerte disparaît automatiquement après 5 secondes
  setTimeout(() => {
    this.alertVisible = false;
    this.cdr.detectChanges();
  }, 5000);
}
loadSessions() {
  const user = this.authService.getUser();

  // On accède à l'ID du tenant en suivant la hiérarchie de ton objet
  // On utilise l'opérateur ?. pour éviter les erreurs si l'objet est absent
  const tenantId = user?.idTenant;

  if (tenantId) {
    console.log("Chargement des sessions pour le Tenant ID:", tenantId);

    this.service.getSessionsByTenant(tenantId).subscribe({
      next: (data) => {
        console.log("Données reçues :", data);
        this.sessions = data;
        this.filteredSessions = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des sessions", err);
        this.showAlert('error', 'Impossible de charger les sessions.');
      }
    });
  } else {
    console.error("Structure utilisateur :", user);
    this.showAlert('error', "ID Tenant introuvable dans votre profil.");
  }
}


  /*openEditModal(s: any) {
    this.selectedSession = s;
    this.addSessionForm.patchValue({
      nomSession: s.nomSession,
      dateDebutInsc: s.dateDebutInsc.split('T')[0],
      dateFinInsc: s.dateFinInsc.split('T')[0],
      moduleTenantId: s.moduleTenant.id
    });
    this.showAddModal = true;
  }*/


openEditModal(s: any) {
  this.loadActiveModules(); // <--- CRUCIAL : Charger la liste pour la recherche
  this.selectedSession = s;
  this.showAddModal = true;

  this.addSessionForm.patchValue({
    nomSession: s.nomSession,
    moduleTenantId: s.moduleTenant?.id,
    dateDebutInsc: s.dateDebutInsc ? s.dateDebutInsc.split('T')[0] : '',
    dateFinInsc: s.dateFinInsc ? s.dateFinInsc.split('T')[0] : ''
  });

  if (s.moduleTenant && s.moduleTenant.module) {
    this.searchTermModule = s.moduleTenant.module.nom;
    this.selectedModuleName = s.moduleTenant.module.nom;
  } else {
    this.searchTermModule = '';
    this.selectedModuleName = '';
  }

  this.showModuleResults = false;
}


submitSession() {

  const data = { ...this.addSessionForm.value };

  // 2. Sécurité : Vérifier si les dates existent avant de concaténer "T00:00:00"
  if (data.dateDebutInsc && !data.dateDebutInsc.includes('T')) {
    data.dateDebutInsc = data.dateDebutInsc + "T00:00:00";
  }
  if (data.dateFinInsc && !data.dateFinInsc.includes('T')) {
    data.dateFinInsc = data.dateFinInsc + "T23:59:59";
  }

  const request = this.selectedSession
    ? this.service.updateSession(this.selectedSession.id, data)
    : this.service.creerSession(data);

  request.subscribe({
    next: () => {
      this.showAlert('success', 'Opération réussie');
      this.closeModal();
      this.loadSessions();
    },
    error: (err) => {
      /*console.error("Détail de l'erreur reçue :", err);

      // Gestion du 403 (Forbidden)
      if (err.status === 403) {
        this.showAlert('error', "Accès refusé (403) : Vérifiez votre connexion ou vos droits.");
        return;
      }

      // Extraction sécurisée du message d'erreur pour éviter le crash "properties of null"
      let errorMessage = 'Une erreur serveur est survenue';

      if (err.error) {
        // On cherche le message dans l'ordre de probabilité (Spring Boot ou ton erreur custom)
        errorMessage = err.error.message || err.error.error || errorMessage;
      }

      this.showAlert('error', errorMessage);*/

      const msg = err.error?.error || "Erreur lors de la création";
        this.showAlert('error', msg);
    }
  });
}




  /*showAlert(type: any, msg: string) {
    this.alertType = type;
    this.alertMessage = msg;
    this.alertVisible = true;
  }*/

  closeModal() { this.showAddModal = false; }
  openDeleteModal(id: number) { this.idToDelete = id; this.showDeleteModal = true; }

  confirmDelete() {
    if (this.idToDelete) {
      this.service.deleteSession(this.idToDelete).subscribe({
        next: () => {
          this.showAlert('success', 'Session supprimée');
          this.showDeleteModal = false;
          this.loadSessions();
          this.cdr.detectChanges(); // Force le rafraîchissement
        },
        error: (err) => {
          this.showAlert('error', 'Erreur lors de la suppression');
          this.showDeleteModal = false;
        }
      });
    }
  }

  loadActiveModules() {
      const user = this.authService.getUser();
      const userId = user?.idUtilisateur;
      if (userId) {
        this.moduleTenantService.getActiveModules(userId).subscribe(data => {
          this.activeModules = data;
          console.log("data : ",data);
          this.filteredModulesForSelect = data;
        });
      }
    }



     openAddModal() {
      this.loadActiveModules(); // On charge les modules au moment d'ouvrir
      this.showAddModal = true;
      this.addSessionForm.reset();
    }



filterModules(event: any) {
  const val = (event.target.value || '').toLowerCase();
  this.searchTermModule = val; // Met à jour la variable liée à l'input
  this.showModuleResults = true; // Affiche la liste des résultats

  if (!this.activeModules || this.activeModules.length === 0) {
    // Si la liste est vide, on tente de la recharger
    this.loadActiveModules();
    return;
  }

  this.filteredModulesForSelect = this.activeModules.filter(mt => {
    return mt?.module?.nom && mt.module.nom.toLowerCase().includes(val);
  });
}

  selectModule(mt: any) {
    // On met à jour le formulaire avec l'ID du module choisi
    this.addSessionForm.patchValue({
      moduleTenantId: mt.id
    });

    // On met à jour l'affichage
    this.selectedModuleName = mt.module.nom;
    this.searchTermModule = mt.module.nom;
    this.showModuleResults = false; // On cache la liste
  }
}
