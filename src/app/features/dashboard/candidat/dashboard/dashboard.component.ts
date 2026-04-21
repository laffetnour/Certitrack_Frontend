import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionInscService } from '../../../../core/services/session-insc.service'; // Adapte le chemin
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service'; // Adapte le chemin

@Component({
  selector: 'app-dashboard-candidat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardCandidatComponent implements OnInit {

  currentUser: any;
  stats = {
    sessionsDisponibles: 0,
    inscriptions: 0
  };

  constructor(
    private sessionService: SessionInscService,
    private inscriptionService: ModuleCandidatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadStats();
  }

  loadStats() {
    // 1. Récupérer le nombre de sessions disponibles (souvent filtrées par le Tenant du candidat)
   const userId = this.currentUser?.idUtilisateur;

    if (userId) {
      this.sessionService.getMySessions(userId).subscribe({
        next: (sessions: any[]) => {

          this.stats.sessionsDisponibles = sessions.length;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur sessions:', err)
      });

         this.inscriptionService.getCountInscriptions(userId).subscribe({
           next: (count) => {

             this.stats.inscriptions = count;
             this.cdr.detectChanges();
           },
           error: (err) => console.error('Erreur stats inscriptions:', err)
         });
       }

  }
}
