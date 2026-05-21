import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
   ) {}

  ngOnInit(): void {

  const user = this.authService.getUser();

      if (user && user?.idUtilisateur) {
        this.loadInscriptions();
        this.loadEpreuves();
        this.loadGmetrixDecision(user.idUtilisateur);
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


allerAuTest(item: any) {
  console.log("Données reçues de l'item :", item);

    const sessionId = item.sessionIdValide || item.sessionId;
    const moduleTenantId = item.idModuleTenant || item.moduleTenantId;

  if (sessionId && moduleTenantId) {
    this.router.navigate(['/candidat/demarrer-test', sessionId, moduleTenantId]);
  } else {
    console.error("Données manquantes dans l'item :", item);
    alert("Impossible de récupérer les informations du module.");
  }
}

  loadEpreuves() {
   const user = this.authService.getUser();
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


  getEpreuve(sessionId: any, moduleTenantId: any) {
    if (!this.epreuves || this.epreuves.length === 0) {
      return null;
    }

    return this.epreuves.find(e =>
      e.sessionId == sessionId &&
      e.moduleTenantId == moduleTenantId
    );
  }

  get recentesInscriptions(): any[] {
    return [...this.mesModulesInscrits].reverse().slice(0, 3);
  }

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
      sessionExamenId: gm.sessionExamenId,
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

  showSuccessModal: boolean = false;

  confirmerReservation(gm: any) {
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

  private handleSuccess() {
    this.annulerFormulaire();
    this.showSuccessModal = true;

    const user = this.authService.getUser();
    if (user) {
      this.loadGmetrixDecision(user.idUtilisateur);
    }
    this.cdr.detectChanges();
  }

  fermerSuccessModal() {
    this.showSuccessModal = false;
  }

  private finaliserReservation() {
    this.annulerFormulaire();
    this.cdr.detectChanges();
    const user = this.authService.getUser();
    if (user) {
      this.loadGmetrixDecision(user.idUtilisateur);
      this.cdr.detectChanges();
    }
  }

  ouvrirFormulaire(gm: any) {
    this.selectedInscriptionId = gm.inscriptionId;
    this.selectedGm = gm;
    this.usernameCertiport = '';
  }

  annulerFormulaire() {
    this.selectedInscriptionId = null;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.usernameCertiport);
  }
}
