import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModuleCandidatService } from '../../../../../core/services/module-candidat.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-demarrer-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demarrer-test.component.html',
  styleUrls: ['./demarrer-test.component.css']
})
export class DemarrerTestComponent implements OnInit {

  sessionId!: number;
  moduleTenantId!: number;

  moduleNom = "";
  duree = 0;
  nbQuestions = 0;

  constructor(
    private route: ActivatedRoute,
    private service: ModuleCandidatService,
    private cdr: ChangeDetectorRef,private router: Router
  ) {}

  // demarrer-test.component.ts
  ngOnInit(): void {
      this.sessionId = +this.route.snapshot.params['sessionId'];
      this.moduleTenantId = +this.route.snapshot.params['moduleTenantId'];

      console.log("IDs récupérés :", this.sessionId, this.moduleTenantId);

      // 2. Appel au service avec les DEUX IDs
      this.service.getTestInfos(this.sessionId, this.moduleTenantId).subscribe({
          next: (res) => {
            this.moduleNom = res.moduleNom;
            this.duree = res.duree;
            this.nbQuestions = res.nbQuestions;
            this.cdr.detectChanges();
          },
          error: (err) => console.error("Erreur 404 : Vérifiez la route API", err)
      });
  }

  /*demarrer() {
    console.log("Démarrage réel du test...");
    // 🔜 prochaine étape : générer épreuve + naviguer vers QCM
  }*/
  /*demarrer() {
    this.service.startTest(this.sessionId).subscribe({
      next: (epreuve) => {
        console.log("EPREUVE =", epreuve);

        // navigation vers composant QCM
        this.router.navigate(['/candidat/qcm'], {
          state: { epreuve: epreuve }
        });
      },
      error: (err) => console.error(err)
    });
  }*/

demarrer() {
  // On envoie les deux IDs au service pour générer l'épreuve
  this.service.startTest(this.sessionId, this.moduleTenantId).subscribe({
    next: (epreuve) => {
      // On passe l'objet epreuve complet au composant QCM
      this.router.navigate(['/candidat/qcm'], { state: { epreuve } });
    },
    error: (err) => {
      // C'est ici que l'erreur "Pas assez de questions" sera interceptée
      alert(err.error?.message || "Erreur lors de la génération du test.");
    }
  });
  }
}
