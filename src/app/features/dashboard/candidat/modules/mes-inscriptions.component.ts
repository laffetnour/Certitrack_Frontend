import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private service: ModuleCandidatService, private cdr: ChangeDetectorRef,private router: Router) {}

  ngOnInit(): void {
    this.loadInscriptions();
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


}
