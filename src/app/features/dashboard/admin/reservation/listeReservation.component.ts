import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReservationService, ReservationDisplayDTO } from '../../../../core/services/reservation.service';
import { SessionExamenService } from '../../../../core/services/session-examen.service';
import { ContextService } from '../../../../core/services/context.service';
import { AuthService } from '../../../../core/services/auth.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listeReservation.component.html',
  styleUrls: ['./listeReservation.component.css']
})
export class ReservationListComponent implements OnInit {
  reservations: ReservationDisplayDTO[] = [];
  sessions: any[] = [];
  selectedSessionId: number | null = null;
  etabId: number | undefined;
  loading: boolean = false;

  constructor(
    private reservationService: ReservationService,
    private sessionService: SessionExamenService,
    private contextService: ContextService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.initContext();
  }

  private initContext() {
    const urlEtabId = this.route.snapshot.params['etabId'];
    const currentUser = this.auth.getUser();

    if (urlEtabId) {
      this.etabId = +urlEtabId;
    } else {
      this.etabId = this.contextService.getEtablissementId() || currentUser?.etablissement?.idEtab;
    }
    if (this.etabId !== undefined && this.etabId !== null) {
      this.loadSessions(this.etabId);
      this.loadReservations(this.etabId);
    } else {
      console.error("Impossible de déterminer l'établissement");
    }
  }

  loadSessions(id: number) {
    this.sessionService.getAll(id).subscribe({
      next: (data) => {
        this.sessions = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement sessions", err)
    });
  }

  loadReservations(id: number) {
    this.loading = true;
    this.reservationService.getReservations(id, this.selectedSessionId).subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error("Erreur chargement réservations", err);
      }
    });
  }

  onFilterChange() {
    if (this.etabId) {
      this.loadReservations(this.etabId);
    }
  }

  exportExcel() {
    if (this.reservations.length === 0 || !this.etabId) return;

    const dataToExport = this.reservations.map(res => ({
      'Nom': res.nomCandidat.toUpperCase(),
      'Prénom': res.prenomCandidat,
      'Email': res.emailCandidat,
      'Module': res.nomModule,
      'Session': res.nomSession,
      'Date Examen': new Date(res.dateExamen).toLocaleString(),
      'Date Réservation': new Date(res.dateReservation).toLocaleDateString(),
      'Username Certiport': res.usernameCertiport
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Réservations': worksheet },
      SheetNames: ['Réservations']
    };

    const objectMaxLength = [];
    const header = Object.keys(dataToExport[0]);
    for (let i = 0; i < header.length; i++) {
      objectMaxLength.push({ wch: header[i].length + 5 });
    }
    worksheet['!cols'] = objectMaxLength;

    XLSX.writeFile(workbook, `Reservations_Etab_${this.etabId}_${new Date().getTime()}.xlsx`);
  }
}
