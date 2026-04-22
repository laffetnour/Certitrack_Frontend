import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminService } from '../../../../core/services/admin.service';
import { ConfigService } from '../../../../core/services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resultats-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultats-sessions.component.html',
  styleUrls: ['./resultats-sessions.component.css']
})
export class ResultatsSessionsComponent implements OnInit {

  sessions: any[] = [];
  resultats: any[] = [];

  selectedSessionId: number | null = null;

  avecTest: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private adminService: AdminService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSessionsCloturees();
  }

  // 🔹 Charger sessions clôturées
  /*loadSessionsCloturees(): void {
    this.loading = true;

    this.adminService.getSessionsCloturees().subscribe({
      next: (data: any) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Erreur lors du chargement des sessions";
        this.loading = false;
      }
    });
  }*/
  loadSessionsCloturees(): void {
    this.adminService.getSessionsCloturees().subscribe({
      next: (data: any) => {
        console.log("SESSIONS RAW:", data);

        this.sessions = data;
        this.cdr.detectChanges();

        console.log("SESSIONS PROCESSED:", this.sessions);
      }
    });
  }

  // 🔹 Quand on change la session
  onSessionChange(event: any): void {
    const sessionId = Number(event.target.value);

    if (!sessionId) {
      this.resultats = [];
      return;
    }

    this.selectedSessionId = sessionId;
    this.loadResultats(sessionId);
  }

  // 🔹 Charger résultats d’une session


  // 🔹 Calcul âge (sécurité côté front si besoin)
  calculAge(dateNaissance: string): number {
    if (!dateNaissance) return 0;

    const birthDate = new Date(dateNaissance);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // 🔹 Style dynamique pour status
  getStatusClass(status: string): string {
    if (!status) return '';

    return status === 'PASSED' ? 'status-passed' : 'status-failed';
  }

  loadResultats(sessionId: number): void {
    this.loading = true;
    this.resultats = []; // Réinitialise pour vider l'ancien tableau

    this.adminService.getResultatsSession(sessionId).subscribe({
      next: (data: any) => {
        console.log("RESULTATS REÇUS:", data);
        this.resultats = data;

        // Détecter si le module est avec test
        this.avecTest = this.resultats.length > 0 && this.resultats.some(r =>
          r.score !== null && r.score !== undefined
        );

        // 🔥 TRI LOGIQUE DEMANDÉ
        if (this.avecTest) {
          this.resultats.sort((a: any, b: any) => {

            // 1. score décroissant
            if (b.score !== a.score) {
              return b.score - a.score;
            }

            // 2. durée croissante (plus petit = meilleur)
            if (a.duree !== b.duree) {
              return a.duree - b.duree;
            }

            // 3. âge décroissant (plus grand = meilleur)
            return b.age - a.age;

          });
        } else {
          // sans test → ordre inscription (backend déjà ok)
          // sinon fallback tri date inscription
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
  formatDuree(sec: number): string {
    if (sec == null) return '-';

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  }

}
