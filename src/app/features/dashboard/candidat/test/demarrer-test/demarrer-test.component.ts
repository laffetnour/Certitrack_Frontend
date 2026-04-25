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

  moduleNom = "Nom du module";
  duree = 30;
  nbQuestions = 20;

  constructor(
    private route: ActivatedRoute,
    private service: ModuleCandidatService,
    private cdr: ChangeDetectorRef,private router: Router
  ) {}

  ngOnInit(): void {
    console.log("COMPONENT DEMARRER TEST CHARGÉ ✅");
    this.sessionId = +this.route.snapshot.params['sessionId'];
    this.moduleTenantId = +this.route.snapshot.params['moduleTenantId'];

    console.log("SESSION ID =", this.sessionId); // 👈 IMPORTANT

    this.service.getTestInfos(this.sessionId).subscribe({
        next: (res) => {
          this.moduleNom = res.moduleNom;
          this.duree = res.duree; // Récupère la durée de la session (ex: 30)
          this.cdr.detectChanges();
        }
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
