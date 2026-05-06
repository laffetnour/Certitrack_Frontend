import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SessionExamenService } from '../../../../core/services/session-examen.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { bootstrapApplication } from '@angular/platform-browser';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-session-examen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './session-examen.component.html',
  styleUrls: ['./session-examen.component.css']
})
export class SessionExamenComponent implements OnInit {

  sessions: any[] = [];
  modulesDisponibles: any[] = [];
  loading = false;
  minDate: string = new Date().toISOString().slice(0, 16);


  sessionForm: any = this.getEmptyForm();

  constructor(
    private sessionService: SessionExamenService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadSessions();
    this.loadModulesRecents();
  }

  getEmptyForm() {
    return {
      id: null,
      nomExamen: '',
      dateHeureExamen: '',
      dateDebutReservation: '',
      dateFinReservation: '',
      capacite: 0,
      centreExamen: '',
      langue: 'Français',
      codeAcces: '',
      modulesAutorises: []
    };
  }



  /*loadSessions() {
    this.loading = true;
    this.sessionService.getAll().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }*/

  loadModulesRecents() {
    this.sessionService.getModulesLastImport().subscribe({
      next: (data) => {
        this.modulesDisponibles = data || [];
        this.cdr.detectChanges();
      }
    });
  }


onModuleToggle(moduleId: number) {
    const index = this.sessionForm.modulesAutorises.indexOf(moduleId);
    if (index > -1) {
      this.sessionForm.modulesAutorises.splice(index, 1);
    } else {
      this.sessionForm.modulesAutorises.push(moduleId);
    }
  }

  isModuleSelected(moduleId: number): boolean {
    return this.sessionForm.modulesAutorises.includes(moduleId);
  }

  /*onSave() {
    if (!this.validateDates()) {
        return;
      }
    const etatCalcule = this.calculerEtatAutomatique(this.sessionForm);
    this.sessionForm.etat = this.calculerEtatAutomatique(this.sessionForm);
    const payload = {
      ...this.sessionForm,
      etat: etatCalcule,
      modulesAutorises: this.sessionForm.modulesAutorises.map((id: number) => {
        const fullModule = this.modulesDisponibles.find(m => m.id === id);
        return {
          id: fullModule.id,
          avecTest: fullModule.avecTest,
          estActif: fullModule.estActif,
          seuilScore: fullModule.seuilScore,
          capacite: fullModule.capacite,
          dateAjout: fullModule.dateAjout
        };
      })
    };

    console.log(payload);

    if (!payload.dateDebutReservation) delete payload.dateDebutReservation;
    if (!payload.dateFinReservation) delete payload.dateFinReservation;
    if (!payload.dateHeureExamen) delete payload.dateHeureExamen;
    if (!payload.id) delete payload.id;

    console.log("Payload envoyé :", payload);

    this.sessionService.save(payload).subscribe({
      next: () => {
        this.loadSessions();
        this.resetForm();
        document.getElementById('closeModal')?.click();
      },
      error: (err) => {
        console.error("Détail erreur :", err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.message || 'Vérifiez les données',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }*/

  onEdit(session: any) {
    this.sessionForm = {
      ...session,
      modulesAutorises: session.modulesAutorises.map((m: any) => m.id)
    };
    this.cdr.detectChanges();
  }

  resetForm() {
    this.sessionForm = this.getEmptyForm();
    this.cdr.detectChanges();
  }

  onDelete(session: any) {
    if (!this.canDelete(session)) {

     Swal.fire({
                 icon: 'error',
                 title: 'Suppression impossible : ',
                 text: ' Seules les sessions PLANIFIEE peuvent être supprimées.',
                 confirmButtonColor: '#3085d6'
               });
      return;
    }

    if (confirm(`Voulez-vous vraiment supprimer la session "${session.nomExamen}" ?`)) {
      this.sessionService.delete(session.id).subscribe({
        next: () => {
          this.loadSessions();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors de la suppression : ',
            text: err.error?.message || 'Problème serveur',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    }
  }

calculerEtatAutomatique(session: any): string {
  const maintenant = new Date();
  const debut = new Date(session.dateDebutReservation);
  const fin = new Date(session.dateFinReservation);

  if (!session.dateDebutReservation || !session.dateFinReservation) return 'PLANIFIEE';

  if (maintenant < debut) {
    return 'PLANIFIEE';
  } else if (maintenant >= debut && maintenant <= fin) {
    return 'EN_COURS';
  } else {
    return 'CLOTUREE';
  }
}


  canEdit(session: any): boolean {
    return session.etat === 'PLANIFIEE';
  }

canDelete(session: any): boolean {
  return session.etat === 'PLANIFIEE';
}

  validateDates(): boolean {
    const maintenant = new Date();
    const debut = new Date(this.sessionForm.dateDebutReservation);
    const fin = new Date(this.sessionForm.dateFinReservation);
    const examen = new Date(this.sessionForm.dateHeureExamen);

    if (!this.sessionForm.dateDebutReservation || !this.sessionForm.dateFinReservation || !this.sessionForm.dateHeureExamen) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text:'Veuillez remplir toutes les dates.',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }

    if (!this.sessionForm.id && debut < maintenant) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'La date de début de réservation doit être dans le futur.',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }

    if (fin <= debut) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'La date de fin de réservation doit être strictement supérieure à la date de début.',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }

    if (examen <= fin) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text:'La date de l examen doit être postérieure à la clôture des réservations.',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }

    return true;
  }

  selectedSession: any = null;

  viewDetails(session: any) {
    this.selectedSession = session;
    console.log(session);
    this.selectedSession.etatCurrent = this.calculerEtatAutomatique(session);
  }


private getSelectedEtabId(): number | undefined {
    const id = localStorage.getItem('selectedEtabId');
    return id ? Number(id) : undefined;
  }


loadSessions() {
    this.loading = true;
    // Récupération de l'ID via votre méthode getSelectedEtabId()
    const etabId = this.getSelectedEtabId();

    this.sessionService.getAll(etabId).subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }



onSave() {
    if (!this.validateDates()) {
        return;
      }
    const etatCalcule = this.calculerEtatAutomatique(this.sessionForm);
    this.sessionForm.etat = this.calculerEtatAutomatique(this.sessionForm);
    const payload = {
      ...this.sessionForm,
      etat: etatCalcule,
      modulesAutorises: this.sessionForm.modulesAutorises.map((id: number) => {
        const fullModule = this.modulesDisponibles.find(m => m.id === id);
        return {
          id: fullModule.id,
          avecTest: fullModule.avecTest,
          estActif: fullModule.estActif,
          seuilScore: fullModule.seuilScore,
          capacite: fullModule.capacite,
          dateAjout: fullModule.dateAjout
        };
      })
    };

    console.log(payload);

    if (!payload.dateDebutReservation) delete payload.dateDebutReservation;
    if (!payload.dateFinReservation) delete payload.dateFinReservation;
    if (!payload.dateHeureExamen) delete payload.dateHeureExamen;
    if (!payload.id) delete payload.id;

    console.log("Payload envoyé :", payload);

    // Récupération de l'ID de l'établissement sélectionné
    const etabId = this.getSelectedEtabId();

    // Passage du payload ET de l'etabId au service
    this.sessionService.save(payload, etabId).subscribe({
      next: () => {
        this.loadSessions();
        this.resetForm();
        document.getElementById('closeModal')?.click();
      },
      error: (err) => {
        console.error("Détail erreur :", err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.message || 'Vérifiez les données',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }
}
