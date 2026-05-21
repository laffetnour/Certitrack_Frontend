import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SessionExamenService } from '../../../../core/services/session-examen.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContextService } from '../../../../core/services/context.service';
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
  sessionForm: any = this.getEmptyForm();
  modulesParCategorie: any[] = [];
  minDate: string = this.getTomorrowDateString();
  selectedCategorie: string = '';
    modulesFiltres: any[] = [];


  constructor(
    private sessionService: SessionExamenService,
    private cdr: ChangeDetectorRef,
    private contextService: ContextService
  ) {}


  ngOnInit(): void {
    this.loadSessions();
    this.loadModulesDisponibles();
  }




getTomorrowDateString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  }


onCategorieChange() {
    const categorieFound = this.modulesParCategorie.find(c => c.nom === this.selectedCategorie);
    this.modulesFiltres = categorieFound ? categorieFound.modules : [];
    this.sessionForm.module.idModule = null;
  }


  getEmptyForm() {
    return {
      id: null,
      nomExamen: '',
      dateHeureExamen: '',
      heuresAvantFermeture: 0,
      capacite: 0,
      centreExamen: '',
      langue: 'Français',
      codeAcces: '',
      module: { idModule: null }
    };
  }


loadModulesDisponibles() {
  const etabId = this.getSelectedEtabId()||  this.contextService.getEtablissementId();
  this.sessionService.getModulesDisponibles().subscribe({
    next: (data: any[]) => {

      const groups = data.reduce((acc: any, obj: any) => {
        const key = obj.nomCategorie || 'Autres';
        if (!acc[key]) acc[key] = [];
        acc[key].push(obj);
        return acc;
      }, {});

      this.modulesParCategorie = Object.keys(groups).map(name => ({
        nom: name,
        modules: groups[name]
      }));
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Erreur chargement modules", err)
  });
}


validateForm(): boolean {
     if (!this.sessionForm.nomExamen || !this.sessionForm.dateHeureExamen || !this.sessionForm.module.idModule) {
       Swal.fire('Erreur', 'Veuillez remplir les champs obligatoires.', 'error');
       return false;
     }

     const maintenant = new Date();
     const examen = new Date(this.sessionForm.dateHeureExamen);
     const demain = new Date();
     demain.setDate(maintenant.getDate() + 1);
     demain.setHours(0, 0, 0, 0);

     if (examen < demain) {
       Swal.fire({
         icon: 'warning',
         title: 'Date invalide',
         text: "Tu dois mettre la date d'examen à partir de demain",
         confirmButtonColor: '#3085d6'
       });
       return false;
     }
     return true;
   }


  isModuleSelected(moduleId: number): boolean {
    return this.sessionForm.modulesAutorises.includes(moduleId);
  }

  resetForm() {
    this.sessionForm = this.getEmptyForm();
    this.selectedCategorie = '';
        this.modulesFiltres = [];
    this.cdr.detectChanges();
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
    const etabId = this.getSelectedEtabId() ||  this.contextService.getEtablissementId();

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
  if (!this.validateForm()) return;
  const payload = { ...this.sessionForm };

  delete payload.etablissement;
  delete payload.reservations;
  const etabId = this.getSelectedEtabId() ||  this.contextService.getEtablissementId();

  this.sessionService.save(payload, etabId).subscribe({
    next: () => {
      Swal.fire('Succès', 'Session enregistrée', 'success');
      this.loadSessions();
      this.resetForm();
      document.getElementById('closeModal')?.click();
    },
    error: (err) => {
      console.error("Erreur save:", err);
      Swal.fire({
        icon: 'error',
        title: 'Action impossible',
        text: err.error?.message || 'Erreur lors de l\'enregistrement (Vérifiez la console)',
      });
    }
  });
}



onEdit(session: any) {
  this.sessionForm = {
    ...session,
    module: { idModule: session.module ? session.module.idModule : null }
  };


      if (session.module) {
        const cat = this.modulesParCategorie.find(c =>
          c.modules.some((m: any) => m.idModule === session.module.idModule)
        );
        if (cat) {
          this.selectedCategorie = cat.nom;
          this.modulesFiltres = cat.modules;
        }
      }
  this.cdr.detectChanges();
}



aEteUtilise(moduleId: number): boolean {
  return this.sessions.some(session =>
    session.moduleAutorise &&
    session.moduleAutorise.id === moduleId &&
    session.etat === 'CLOTUREE'
  );
}

}
