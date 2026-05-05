import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { ContextService } from '../../../../core/services/context.service';
import { AuthService } from '../../../../core/services/auth.service';


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
    private auth: AuthService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.loadSessionsCloturees();
    this.loadResultats();
  }

  loadSessionsCloturees(): void {
     const currentUser = this.auth.getUser();
          const idEtab = currentUser?.etablissements?.[0]?.id ||
                         currentUser?.etablissements?.[0]?.idEtab ||
                         this.contextService.getEtablissementId();
    this.adminService.getSessionsCloturees(idEtab).subscribe({
      next: (data: any) => {
        this.sessions = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }


  loadResultats(): void {

    const currentUser = this.auth.getUser();
      const idEtab = currentUser?.etablissements?.[0]?.id ||
                     currentUser?.etablissements?.[0]?.idEtab ||
                     this.contextService.getEtablissementId();

    const filters = {
      sessionId: this.selectedSessionId,
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null
    };

    this.loading = true;

    this.adminService.getResultats(filters, idEtab).subscribe({
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

  exportExcel(): void {

    const currentUser = this.auth.getUser();
      const idEtab = currentUser?.etablissements?.[0]?.id ||
                     currentUser?.etablissements?.[0]?.idEtab ||
                     this.contextService.getEtablissementId();

    this.adminService.exportResultats({
      sessionId: this.selectedSessionId,
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null
    }, idEtab).subscribe((blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'resultats.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }




}
