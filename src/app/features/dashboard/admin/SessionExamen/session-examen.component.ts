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
  //minDate: string = new Date().toISOString().slice(0, 16);


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
    this.loadModulesDisponibles(); // Changé ici
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
    // Réinitialiser le module choisi si on change de catégorie
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
      //moduleAutoriseId: null // Modifié ici
      module: { idModule: null }
    };
  }

/*loadModulesRecents() {
  const etabId = this.getSelectedEtabId()||  this.contextService.getEtablissementId();
  this.sessionService.getModulesLastImport(etabId).subscribe({
    next: (data) => {
      console.log("Modules chargés :", data);
      this.modulesDisponibles = data || [];
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Erreur chargement modules", err)
  });
}*/


loadModulesDisponibles() {
  const etabId = this.getSelectedEtabId()||  this.contextService.getEtablissementId();
  this.sessionService.getModulesDisponibles().subscribe({
    next: (data: any[]) => {
      // On groupe les modules par nom de catégorie pour l'affichage
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

  /*canEdit(session: any): boolean {
    return session.etat === 'PLANIFIEE';
  }*/

/*canDelete(session: any): boolean {
  return session.etat === 'PLANIFIEE';
}*/

  /*validateDates(): boolean {
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
  }*/

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

  //const etatCalcule = this.calculerEtatAutomatique(this.sessionForm);

  // Recherche du module sélectionné pour construire l'objet moduleAutorise
  //const selectedMod = this.modulesDisponibles.find(m => m.id === this.sessionForm.moduleAutoriseId);

  // Construction du payload
  /*const payload = {
    ...this.sessionForm,
    etat: etatCalcule,
    moduleAutorise: selectedMod ? {
      id: selectedMod.id,
      avecTest: selectedMod.avecTest,
      estActif: selectedMod.estActif,
      seuilScore: selectedMod.seuilScore,
      capacite: selectedMod.capacite,
      dateAjout: selectedMod.dateAjout
    } : null
  };*/
  const payload = { ...this.sessionForm };



  //delete payload.moduleAutoriseId;
  delete payload.etablissement;    // Ne pas renvoyer l'objet Etablissement complet
  delete payload.reservations;     // Ne pas renvoyer la liste des réservations
  // -----------------------------------------

  const etabId = this.getSelectedEtabId() ||  this.contextService.getEtablissementId();

  // Appels au service
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
    // On récupère l'ID du module unique au lieu d'un tableau
    //moduleAutoriseId: session.moduleAutorise ? session.moduleAutorise.id : null
    module: { idModule: session.module ? session.module.idModule : null }
  };

  // Retrouver la catégorie du module pour l'afficher dans le select
      if (session.module) {
        // On cherche dans quelle catégorie se trouve ce module
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


/*onDelete(session: any) {
  // 1. Vérification de sécurité locale
  if (!this.canDelete(session)) {
    Swal.fire({
      icon: 'error',
      title: 'Suppression impossible',
      text: 'Seules les sessions PLANIFIEE peuvent être supprimées.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  // 2. Affichage de la confirmation via SweetAlert2 (Modal)
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: `Vous allez supprimer la session "${session.nomExamen}". Cette action est irréversible !`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer !',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    // 3. Si l'utilisateur a cliqué sur "Oui, supprimer !"
    if (result.isConfirmed) {
      this.sessionService.delete(session.id).subscribe({
        next: () => {
          Swal.fire(
            'Supprimé !',
            'La session a bien été supprimée.',
            'success'
          );
          this.loadSessions(); // Recharger la liste
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Une erreur est survenue lors de la suppression.',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    }
  });
}*/
}
