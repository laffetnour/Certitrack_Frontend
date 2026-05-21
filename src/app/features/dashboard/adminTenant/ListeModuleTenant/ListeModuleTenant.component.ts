import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import {ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive,ActivatedRoute } from '@angular/router';
import { SessionInscService } from '../../../../core/services/session-insc.service';

import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-module-tenant',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink, RouterLinkActive],
  templateUrl: './ListeModuleTenant.component.html',
  styleUrls: ['./ModuleTenant.component.css']
})
export class ListeModuleTenantComponent implements OnInit {

  idTenant: string | null = null;
  myModules: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  selectedMyModulesIds = new Set<number>();

  selectedModuleForTest: any = null;

  testForm = {
    avecTest: false,
    seuilScore: null as number | null,
    capacite: null as number | null
  };

  selectedModuleConfig: any = null;

  configForm = {
    estActif: false,
    avecTest: false
  };

  filteredMyModules: any[] = [];
  searchTerm: string = '';
  testFilter: string = '';
  statusFilter: string = '';
  selectedModuleForSession: any = null;
  showChoiceModal = false;
  showSessionFormModal = false;
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
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.parent?.paramMap.subscribe(params => {
          this.idTenant = params.get('idTenant');

        })
    this.loadMyCatalogue();

  }

  loadMyCatalogue(): void {
    this.loading = true;
    const user = this.authService.getUser();
    console.log(user);


    let targetId: number;
        if ((user.role === 'superAdmin' || user.role === 'SUPER_ADMIN') && this.idTenant) {
          targetId = Number(this.idTenant);
        } else {
          targetId = user?.idUtilisateur;
        }

        if (!targetId) {
          this.errorMessage = "Identifiant introuvable.";
          this.loading = false;
          return;
        }


      this.moduleTenantService.getMyModules(targetId).subscribe({
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


  onRemoveModule(moduleTenantId: number): void {
    const module = this.myModules.find(m => m.id === moduleTenantId);


    if (module && module.sessions && module.sessions.length > 0) {
      this.showAlert('warning', '⚠️ Suppression impossible : Ce module possède un historique de sessions(planifiée , en cours ou cloturée).');
      return;
    }

    if (confirm('Voulez-vous vraiment retirer ce module de votre catalogue ?')) {
      this.moduleTenantService.deleteModuleTenant(moduleTenantId).subscribe({
        next: () => {
          this.myModules = this.myModules.filter(m => m.id !== moduleTenantId);
          this.applyFilters();

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

      this.filteredMyModules.forEach(mt => this.selectedMyModulesIds.add(mt.id));
    } else {

      this.filteredMyModules.forEach(mt => this.selectedMyModulesIds.delete(mt.id));
    }
  }


  isAllMyModulesSelected(): boolean {
    return this.filteredMyModules.length > 0 &&
      this.filteredMyModules.every(m => this.selectedMyModulesIds.has(m.id));
  }


  openTestForm(mt: any) {
    this.selectedModuleForTest = mt;
    this.isLocked = mt.sessions?.some((s: any) => s.etat !== 'cloturee');

    this.testForm = {
      avecTest: mt.avecTest,
      seuilScore: mt.seuilScore,
      capacite: mt.capacite
    };
  }


  confirmTest() {

    const mt = this.selectedModuleForTest;
    if (!mt) return;
    const avecTestVal = String(this.testForm.avecTest) === 'true';
    const seuil = this.testForm.seuilScore ? Number(this.testForm.seuilScore) : null;
    const capa = this.testForm.capacite ? Number(this.testForm.capacite) : null;

    this.moduleTenantService.configTest(
      mt.id,
      avecTestVal,
      seuil,
      capa
    ).subscribe({
      next: (updatedMt: any) => {

        const index = this.myModules.findIndex(m => m.id === updatedMt.id);
        if (index !== -1) {
          this.myModules[index] = { ...updatedMt };
          this.myModules = [...this.myModules];
          this.applyFilters();
        }


        this.selectedModuleForTest = null;
        this.cdr.detectChanges();

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

        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        let msg = "Une erreur est survenue";
        if (typeof err.error === 'string') msg = err.error;
        else if (err.error?.message) msg = err.error.message;
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

        this.myModules = this.myModules.map(m => {
          if (res.successIds.includes(m.id)) {
            return { ...m, estActif: status };
          }
          return m;
        });


        this.selectedMyModulesIds.clear();

        this.applyFilters();

        if (res.errors && res.errors.length > 0) {
          this.showAlert('warning', res.errors.join('\n'));
        } else {

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

      const matchesSearch = mt.module.nom.toLowerCase().includes(this.searchTerm.toLowerCase());


      let matchesTest = true;
      if (this.testFilter === 'with') matchesTest = mt.avecTest === true;
      if (this.testFilter === 'without') matchesTest = mt.avecTest === false;


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


  hasActiveSession(mt: any): boolean {
    if (!mt?.sessions || mt.sessions.length === 0) return false;

    return mt.sessions.some((s: any) => {

      if (!s.etat) return false;

      const etatNormalise = s.etat.toString().toLowerCase();

      return etatNormalise === 'encours' || etatNormalise === 'en_cours';
    });
  }

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

        this.myModules = this.myModules.filter(m => !res.successIds.includes(m.id));

        this.selectedMyModulesIds.clear();
        this.applyFilters();
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


sessionForm = {
  titre: '',
  dateDebut: '',
  dateFin: '',
  dureeMax: null as number | null,
  nbreQuestionTechnique: null as number | null
};

onBulkAddSession() {
  if (this.selectedMyModulesIds.size === 0) {
    this.showAlert('warning', '⚠️ Veuillez sélectionner au moins un module.');
    return;
  }

  const selectedModules = this.myModules.filter(m => this.selectedMyModulesIds.has(m.id));
  const hasInactive = selectedModules.some(m => !m.estActif);

  if (hasInactive) {
    this.showAlert('warning', '⚠️ Certains modules sélectionnés sont inactifs. Activez-les d\'abord.');
    return;
  }

  this.sessionForm = {
    titre: '',
    dateDebut: '',
    dateFin: '',
    dureeMax: null,
    nbreQuestionTechnique: null
  };

  this.sessionChoice = selectedModules.some(m => m.avecTest);

  this.showSessionFormModal = true;
}

submitSession() {
  const ids = Array.from(this.selectedMyModulesIds);
  const user = this.authService.getUser();

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

  const sessionPayload = {
    ...this.sessionForm,
    dureeMax: this.sessionForm.dureeMax ?? undefined,
    nbreQuestionTechnique: this.sessionForm.nbreQuestionTechnique ?? undefined
  };

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
