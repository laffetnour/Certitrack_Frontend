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
  minDate: string = new Date().toISOString().slice(0, 16);


  sessionForm: any = this.getEmptyForm();

  constructor(
    private sessionService: SessionExamenService,
    private cdr: ChangeDetectorRef,
    private contextService: ContextService
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
      //modulesAutorises: []
      moduleAutoriseId: null // Modifié ici
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

  /*loadModulesRecents() {
    this.sessionService.getModulesLastImport().subscribe({
      next: (data) => {
        console.log("rrrrr",data);
        this.modulesDisponibles = data || [];
        this.cdr.detectChanges();
      }
    });
  }*/

loadModulesRecents() {
  const etabId = this.getSelectedEtabId()||  this.contextService.getEtablissementId();
  this.sessionService.getModulesLastImport(etabId).subscribe({
    next: (data) => {
      console.log("Modules chargés :", data);
      this.modulesDisponibles = data || [];
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Erreur chargement modules", err)
  });
}


/*onModuleToggle(moduleId: number) {
    const index = this.sessionForm.modulesAutorises.indexOf(moduleId);
    if (index > -1) {
      this.sessionForm.modulesAutorises.splice(index, 1);
    } else {
      this.sessionForm.modulesAutorises.push(moduleId);
    }
  }*/

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

  /*onEdit(session: any) {
    this.sessionForm = {
      ...session,
      modulesAutorises: session.modulesAutorises.map((m: any) => m.id)
    };
    this.cdr.detectChanges();
  }*/



  resetForm() {
    this.sessionForm = this.getEmptyForm();
    this.cdr.detectChanges();
  }

  /*onDelete(session: any) {
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
  }*/

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
  }*/


onSave() {
  if (!this.validateDates()) return;

  const etatCalcule = this.calculerEtatAutomatique(this.sessionForm);

  // Recherche du module sélectionné pour construire l'objet moduleAutorise
  const selectedMod = this.modulesDisponibles.find(m => m.id === this.sessionForm.moduleAutoriseId);

  // Construction du payload
  const payload = {
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
  };

  // --- CORRECTION ERREUR 403 : NETTOYAGE ---
  // On retire les objets complexes et IDs temporaires pour que le backend accepte la modif
  delete payload.moduleAutoriseId;
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
    moduleAutoriseId: session.moduleAutorise ? session.moduleAutorise.id : null
  };
  this.cdr.detectChanges();
}


/*isModuleDesactive(moduleId: number): boolean {
  const moduleDeLImport = this.modulesDisponibles.find(m => m.value === moduleId);

  if (!moduleDeLImport) return false;

  const sessionsDuLotActuel = this.sessions.filter(session => {
    return session.moduleAutorise &&
           this.modulesDisponibles.some(m => Number(m.value) === Number(session.moduleAutorise.id));
  });

  const sessionBloquante = sessionsDuLotActuel.find(session => {
    const idModuleSession = session.moduleAutorise.module ? session.moduleAutorise.module.id : session.moduleAutorise.id;

    const estLeMemeModule = Number(idModuleSession) === Number(moduleId);
    const estUneAutreSession = session.id !== this.sessionForm.id;

    return estLeMemeModule && estUneAutreSession;
  });

  if (sessionBloquante) {
    console.warn(`🚫 BLOQUÉ : "${moduleDeLImport.label}" est déjà utilisé dans la session "${sessionBloquante.nomExamen}" du DERNIER IMPORT.`);
    return true;
  }

  return false;
}
*/

isModuleDesactive(moduleId: number): boolean {
  if (!moduleId || !this.sessions || this.sessions.length === 0) return false;

  if (moduleId === 29) console.log("--- Début vérification Java Avancé (29) ---");

  // On cherche la session qui possède EXACTEMENT ce moduleId
  const sessionBloquante = this.sessions.find(s => {
    const isSameId = s.moduleAutorise && Number(s.moduleAutorise.id) === Number(moduleId);

    // Log uniquement pour le module qui pose problème
    if (isSameId && moduleId === 29) {
      console.log(`  > Java (29) trouvé dans session: ${s.nomExamen} (ID: ${s.id}), Etat: ${s.etat}`);
    }

    return isSameId;
  });

  // Si aucune session n'existe pour ce module précis
  if (!sessionBloquante) {
    if (moduleId === 29) console.log("  > Résultat : LIBRE (Aucune session trouvée)");
    return false;
  }

  // On vérifie si c'est la session qu'on est en train d'éditer
  const estSessionEnEdition = sessionBloquante.id === this.sessionForm.id;

  // On ne grise QUE si (Ce n'est pas la session en édition) ET (L'état n'est pas CLOTUREE)
  const resultat = !estSessionEnEdition && sessionBloquante.etat !== 'CLOTUREE';

  if (moduleId === 29) console.log("  > Résultat final :", resultat ? "GRISÉ" : "LIBRE");

  return resultat;
}
aEteUtilise(moduleId: number): boolean {
  return this.sessions.some(session =>
    session.moduleAutorise &&
    session.moduleAutorise.id === moduleId &&
    session.etat === 'CLOTUREE'
  );
}


onDelete(session: any) {
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
}
}
