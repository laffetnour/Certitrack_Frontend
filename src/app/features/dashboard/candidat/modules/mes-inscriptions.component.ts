import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
/*import { ConfigService } from '../../../../core/services/config.service';*/
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mes-inscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-inscriptions.component.html',
  styleUrls: ['./mes-inscriptions.component.css']
})
export class MesInscriptionsComponent implements OnInit {
  mesModulesInscrits: any[] = [];
  inscriptionsIds: number[] = [];
  loading: boolean = true;
  epreuves: any[] = [];
  inscriptionsGmetrix: any[] = [];

  selectedGm: any = null;
  usernameCertiport: string = '';
  selectedInscriptionId: number | null = null;

  constructor(private service: ModuleCandidatService,
    private cdr: ChangeDetectorRef,private router: Router,
    private authService: AuthService
   /* public configService: ConfigService*/) {}

  ngOnInit(): void {

  const user = this.authService.getUser();

      if (user && user?.idUtilisateur) {
        this.loadInscriptions();
        this.loadEpreuves();
        this.loadGmetrixDecision(user.idUtilisateur); // 🔥 AJOUT
      } else {
        this.loading = false;
        console.warn("Utilisateur non connecté ou ID manquant");
      }


  }

 loadInscriptions() {
   this.service.getModules().subscribe({
     next: (res: any) => {
       console.log("Réponse reçue :", res);
       this.mesModulesInscrits = res.inscriptionsDetail || [];

       console.log("Détails des inscriptions à afficher :", this.mesModulesInscrits);
       this.loading = false;

       this.cdr.detectChanges();
     },
     error: (err) => {
       console.error(err);
       this.loading = false;
       this.cdr.detectChanges();
     }
   });
 }

  /*allerAuTest(idSession: number) {
    console.log("Lancement du test pour la session ID :", idSession);
    // Logique de navigation vers le composant de test ici
     this.router.navigate(['/candidat/test', idSession]);
  }*/

allerAuTest(item: any) {
  console.log("Données reçues de l'item :", item); // 🔥 Regarde ceci dans la console F12

    const sessionId = item.sessionIdValide || item.sessionId; // Ajout d'un fallback
    const moduleTenantId = item.idModuleTenant || item.moduleTenantId;

  if (sessionId && moduleTenantId) {
    this.router.navigate(['/candidat/demarrer-test', sessionId, moduleTenantId]);
  } else {
    console.error("Données manquantes dans l'item :", item);
    alert("Impossible de récupérer les informations du module.");
  }
}

  loadEpreuves() {
   const user = this.authService.getUser(); // 🔥 Utilisation propre
       if (!user?.idUtilisateur) return;

    this.service.getEpreuves(user?.idUtilisateur).subscribe({
      next: (res) => {
        console.log("Epreuves reçues du backend:", res);
        this.epreuves = res;
        console.log("📊 EPREUVES ARRAY =", this.epreuves);

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }


  /*getEpreuve(sessionId: any) {
    if (!this.epreuves || this.epreuves.length === 0 || !sessionId) {
      return null;
    }

    // On compare l'ID reçu avec le sessionId de l'épreuve
    const epreuveTrouvee = this.epreuves.find(e => e.sessionId == sessionId);

    if (epreuveTrouvee) {
      console.log(`✅ Match trouvé pour session ${sessionId}`);
    }

    return epreuveTrouvee;
  }*/

  getEpreuve(sessionId: any, moduleTenantId: any) {
    if (!this.epreuves || this.epreuves.length === 0) {
      return null;
    }

    return this.epreuves.find(e =>
      e.sessionId == sessionId &&
      e.moduleTenantId == moduleTenantId
    );
  }

  // ... dans ta classe MesInscriptionsComponent ...

// Getter pour récupérer les 3 dernières inscriptions
  get recentesInscriptions(): any[] {
    // On crée une copie pour ne pas modifier l'original, puis on inverse l'ordre
    return [...this.mesModulesInscrits].reverse().slice(0, 3);
  }

// Getter pour le reste des inscriptions (toutes sauf les 3 récentes)
  get autresInscriptions(): any[] {
    return [...this.mesModulesInscrits].reverse().slice(3);
  }

  loadGmetrixDecision(id: number) {
    this.service.getInscriptionsGmetrix(id).subscribe({
      next: (res) => {
        this.inscriptionsGmetrix = res;
        console.log("📊 GMetrix Decision =", res);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  getDecision(item: any) {
    if (!this.inscriptionsGmetrix || this.inscriptionsGmetrix.length === 0) return null;

    // On cherche par l'ID du module tenant qui est présent dans les deux objets
    return this.inscriptionsGmetrix.find(x => x.moduleTenantId === item.idModuleTenant);
  }

  hasGmetrix(item: any): boolean {
    const gm = this.getDecision(item);
    return gm?.scoreGmetrix != null;
  }

  reserverExamen(gm: any) {

    const user = this.authService.getUser();

    this.service.reserverExamen({
      inscriptionId: gm.inscriptionId,
      sessionExamenId: gm.sessionExamenId, // ⚠️ tu dois l’ajouter backend si pas encore
      usernameCertiport: user.username
    }).subscribe({
      next: () => {
        alert("Réservation confirmée");
        this.loadGmetrixDecision(user.idUtilisateur);
      },
      error: (err) => {
        alert(err.error?.message || "Erreur réservation");
      }
    });
  }



  /*confirmerReservation(gm: any) {

    if (!this.usernameCertiport || this.usernameCertiport.trim() === '') {
      alert("Veuillez entrer votre username Certiport");
      return;
    }

    this.service.reserverExamen({
      inscriptionId: gm.inscriptionId,
      sessionExamenId: gm.sessionExamenId,
      usernameCertiport: this.usernameCertiport
    }).subscribe({
      next: () => {
        alert("Réservation confirmée ✅");
        this.annulerFormulaire();

        const user = this.authService.getUser();
        this.loadGmetrixDecision(user.idUtilisateur);
      },
      error: (err) => {
        alert(err.error?.message || "Erreur réservation");
      }
    });
  }*/

  // 1. Ajoutez cette variable en haut de votre classe
  showSuccessModal: boolean = false;

// 2. Modifiez la fonction confirmerReservation
  confirmerReservation(gm: any) {
    // On ne met pas d'alert() ici, le message s'affiche déjà dans le HTML via isEmailValid()
    if (!this.isEmailValid()) {
      return;
    }

    this.service.reserverExamen({
      inscriptionId: gm.inscriptionId,
      sessionExamenId: gm.sessionExamenId,
      usernameCertiport: this.usernameCertiport
    }).subscribe({
      next: (res) => {
        this.handleSuccess();
      },
      error: (err) => {
        if (err.status === 200) {
          this.handleSuccess();
        } else {
          console.error(err);
          alert(err.error?.message || "Erreur réservation");
        }
      }
    });
  }

// 3. Créez cette fonction pour gérer la réussite
  private handleSuccess() {
    this.annulerFormulaire(); // Ferme le modal de saisie
    this.showSuccessModal = true; // Ouvre le modal de succès

    const user = this.authService.getUser();
    if (user) {
      this.loadGmetrixDecision(user.idUtilisateur);
    }
    this.cdr.detectChanges();
  }

// 4. Fonction pour fermer le modal de succès
  fermerSuccessModal() {
    this.showSuccessModal = false;
  }

// Fonction utilitaire pour éviter de répéter le code de fermeture
  private finaliserReservation() {
    this.annulerFormulaire();
    this.cdr.detectChanges();
    const user = this.authService.getUser();
    if (user) {
      this.loadGmetrixDecision(user.idUtilisateur);
      this.cdr.detectChanges();
    }
  }



  /*ouvrirFormulaire(gm: any) {
    console.log("Ouverture du formulaire pour l'inscription :", gm.inscriptionId);
    this.selectedInscriptionId = gm.inscriptionId; // C'est cette ligne qui déclenche le *ngIf dans le HTML
    this.usernameCertiport = ''; // Reset du champ
    this.cdr.detectChanges();
  }*/

  ouvrirFormulaire(gm: any) {
    this.selectedInscriptionId = gm.inscriptionId;
    this.selectedGm = gm; // 🔥 IMPORTANT
    this.usernameCertiport = '';
  }

  annulerFormulaire() {
    this.selectedInscriptionId = null;
  }

  // À ajouter dans votre classe
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.usernameCertiport);
  }
}
