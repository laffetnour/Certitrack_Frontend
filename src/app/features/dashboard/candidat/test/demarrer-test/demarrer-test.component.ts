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

  // temporaire (plus tard API)
  moduleNom = "Nom du module";
  duree = 30;
  nbQuestions = 20;

  constructor(
    private route: ActivatedRoute,
    private service: ModuleCandidatService, private cdr: ChangeDetectorRef,private router: Router
  ) {}

  ngOnInit(): void {
    console.log("COMPONENT DEMARRER TEST CHARGÉ ✅");
    this.sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));

    console.log("SESSION ID =", this.sessionId); // 👈 IMPORTANT

    this.service.getTestInfos(this.sessionId).subscribe({
      next: (res) => {
        console.log("DATA =", res); // 👈 DEBUG
        this.moduleNom = res.moduleNom;
        this.duree = res.duree;
        this.cdr.detectChanges(); // 👈 LA SOLUTION
      },
      error: (err) => {
        console.error("ERREUR API =", err);
      }
    });
  }

  /*demarrer() {
    console.log("Démarrage réel du test...");
    // 🔜 prochaine étape : générer épreuve + naviguer vers QCM
  }*/
  demarrer() {
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
  }
}
