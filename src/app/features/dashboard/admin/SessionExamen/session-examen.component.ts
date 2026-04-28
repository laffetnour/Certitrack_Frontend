import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SessionExamenService } from '../../../../core/services/session-examen.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { bootstrapApplication } from '@angular/platform-browser';


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



  loadSessions() {
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
  }

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

  onSave() {
    if (!this.validateDates()) {
        return;
      }
    this.sessionForm.etat = this.calculerEtatAutomatique(this.sessionForm);
    const payload = {
      ...this.sessionForm,
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
        alert("Erreur : " + (err.error?.message || "Vérifiez les données"));
      }
    });
  }

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
      alert("Suppression impossible : Seules les sessions 'PLANIFIEE' peuvent être supprimées.");
      return;
    }

    if (confirm(`Voulez-vous vraiment supprimer la session "${session.nomExamen}" ?`)) {
      this.sessionService.delete(session.id).subscribe({
        next: () => {
          this.loadSessions();
        },
        error: (err) => {
          alert("Erreur lors de la suppression : " + (err.error || "Problème serveur"));
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
      alert("Veuillez remplir toutes les dates.");
      return false;
    }

    if (!this.sessionForm.id && debut < maintenant) {
      alert("La date de début de réservation doit être dans le futur.");
      return false;
    }

    if (fin <= debut) {
      alert("La date de fin de réservation doit être strictement supérieure à la date de début.");
      return false;
    }

    if (examen <= fin) {
      alert("La date de l'examen doit être postérieure à la clôture des réservations.");
      return false;
    }

    return true;
  }
}
