import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from '../../../../core/services/config.service';

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

  constructor(private service: ModuleCandidatService, private cdr: ChangeDetectorRef,private router: Router, public configService: ConfigService) {}

  ngOnInit(): void {

    this.loadInscriptions();
    //ajouterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
    this.loadEpreuves();

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

  allerAuTest(idSession: number) {
    console.log("Lancement du test pour la session ID :", idSession);
    // Logique de navigation vers le composant de test ici
     this.router.navigate(['/candidat/test', idSession]);
  }

//ajouterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
  loadEpreuves() {
    const user = this.service['authService'].getUser();
    const idCandidat = user?.idUtilisateur;

    this.service.getEpreuves(idCandidat).subscribe({
      next: (res) => {
        console.log("Epreuves reçues du backend:", res);
        this.epreuves = res;
        console.log("📊 EPREUVES ARRAY =", this.epreuves);

        this.cdr.detectChanges(); // IMPORTANT : Informe Angular que les données sont arrivées
      },
      error: (err) => console.error(err)
    });
  }


  getEpreuve(sessionId: any) {
    if (!this.epreuves || this.epreuves.length === 0 || !sessionId) {
      return null;
    }

    // On compare l'ID reçu avec le sessionId de l'épreuve
    const epreuveTrouvee = this.epreuves.find(e => e.sessionId == sessionId);

    if (epreuveTrouvee) {
      console.log(`✅ Match trouvé pour session ${sessionId}`);
    }

    return epreuveTrouvee;
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
}
