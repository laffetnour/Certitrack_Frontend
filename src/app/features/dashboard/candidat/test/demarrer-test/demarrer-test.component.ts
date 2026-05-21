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

  ngOnInit(): void
  {
      this.sessionId = +this.route.snapshot.params['sessionId'];
      this.moduleTenantId = +this.route.snapshot.params['moduleTenantId'];
      console.log("IDs récupérés :", this.sessionId, this.moduleTenantId);
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


  demarrer() {
    this.service.startTest(this.sessionId, this.moduleTenantId).subscribe({
      next: (epreuve) => {
        this.router.navigate(['/candidat/qcm'], { state: { epreuve } });
      },
      error: (err) => {
        alert(err.error?.message || "Erreur lors de la génération du test.");
      }
    });
    }
}
