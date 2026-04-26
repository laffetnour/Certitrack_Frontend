import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-resultats-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resultats-sessions.component.html',
  styleUrls: ['./resultats-sessions.component.css']
})
export class ResultatsSessionsComponent implements OnInit {

  sessions: any[] = [];
  resultats: any[] = [];

  selectedSessionId: number | null = null;

  dateDebut: string = '';
  dateFin: string = '';

  avecTest: boolean = false;
  loading: boolean = false;
  canExport: boolean = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSessionsCloturees();
    this.loadResultats(); // charger tout au début
  }

  // 🔹 charger sessions clôturées
  loadSessionsCloturees(): void {
    this.adminService.getSessionsCloturees().subscribe({
      next: (data: any) => {
        this.sessions = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // 🔹 changement session
 /* onSessionChange(event: any): void {
    this.selectedSessionId = Number(event.target.value) || null;
    this.loadResultats();
  }*/

  // 🔹 chargement résultats (API principale)
  /*loadResultats(): void {
    this.loading = true;
    console.log("FILTERS SENT:");
    console.log("sessionId:", this.selectedSessionId);
    console.log("dateDebut:", this.dateDebut);
    console.log("dateFin:", this.dateFin);

    this.adminService.getResultats({
      sessionId: this.selectedSessionId,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    }).subscribe({
      next: (data: any) => {
        this.resultats = data;

        // détecter si au moins un test existe
        this.avecTest = this.resultats.some((r: any) => r.score != null);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }*/

  loadResultats(): void {

    const filters = {
      sessionId: this.selectedSessionId,
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null
    };

    this.loading = true;

    this.adminService.getResultats(filters).subscribe({
      next: (data: any) => {
        this.resultats = data;

        this.avecTest = this.resultats.some((r: any) => r.score != null);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur API", err);
        this.loading = false;
      }
    });
  }

  // 🔹 format durée
  formatDuree(sec: number): string {
    if (sec == null) return '-';

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  }

  onSessionChange(event: any): void {
    const value = event.target.value;
    this.selectedSessionId = value ? Number(value) : null;

    this.loadResultats();
  }

  /*exportExcel(): void {

    if (!this.selectedSessionId) {
      alert("Veuillez sélectionner une session");
      return;
    }

    this.adminService.exportResultats({
      sessionId: this.selectedSessionId,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin
    }).subscribe((blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'resultats.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }*/

  exportExcel(): void {

    this.adminService.exportResultats({
      sessionId: this.selectedSessionId,
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null
    }).subscribe((blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'resultats.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }




}
