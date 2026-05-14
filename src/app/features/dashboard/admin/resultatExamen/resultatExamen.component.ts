import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionExamenService } from '../../../../core/services/session-examen.service';
import { ResultatExamenService } from '../../../../core/services/resultatExamen.service';
import { ContextService } from '../../../../core/services/context.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ViewChild, ElementRef } from '@angular/core';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-resultat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resultatExamen.component.html',
  styleUrls: ['./resultatExamen.component.css']
})
export class ResultatExamenComponent implements OnInit {
  sessionsCloturees: any[] = [];
  selectedSessionId: number | null = null;
  selectedFile: File | null = null;
  uploading: boolean = false;
  resultats: any[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private sessionService: SessionExamenService,
    private resultatService: ResultatExamenService,
    private contextService: ContextService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    const currentUser = this.auth.getUser();
    const etabId = this.contextService.getEtablissementId() || currentUser?.etablissement?.idEtab;

    if (etabId) {
      this.sessionService.getAll(etabId).subscribe({
        next: (data) => {
          console.log("data : ",data);
          this.sessionsCloturees = data.filter((s: any) => s.etat === 'CLOTUREE');
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Erreur sessions", err)
      });
    }
  }

  onDownloadTemplate() {
    if (!this.selectedSessionId) return;

    this.resultatService.downloadTemplate(this.selectedSessionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Template_Certiport_Session_${this.selectedSessionId}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.cdr.detectChanges();
      },
      error: (err) => Swal.fire('Erreur', 'Impossible de générer le modèle', 'error')
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.cdr.detectChanges();
  }

  onSessionChange() {
    if (this.selectedSessionId) {
      this.loadResultats(this.selectedSessionId);
    } else {
      this.resultats = [];
      this.cdr.detectChanges();
    }
  }

  loadResultats(sessionId: number) {
    this.resultatService.getResultatsBySession(sessionId).subscribe({
      next: (data) => {
        this.resultats = data;
        console.log(data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors du chargement des scores", err);
        this.resultats = [];
        this.cdr.detectChanges();
      }
    });
  }

  /*onUpload() {
    if (!this.selectedFile || !this.selectedSessionId) return;

    this.uploading = true;
    this.resultatService.importExcel(this.selectedFile, this.selectedSessionId).subscribe({
      next: (response) => {
        this.uploading = false;
        Swal.fire('Succès', 'Les résultats ont été importés !', 'success');

        this.loadResultats(this.selectedSessionId!);

        this.selectedFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploading = false;
        Swal.fire('Erreur', 'Échec de l\'importation', 'error');
        this.cdr.detectChanges();
      }
    });
  }*/



onUpload() {
  if (!this.selectedFile || !this.selectedSessionId) return;

  this.uploading = true;
  this.cdr.detectChanges();

  this.resultatService.importExcel(this.selectedFile, this.selectedSessionId).subscribe({
    next: (errors: any) => {
      this.uploading = false;

      this.selectedFile = null;
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }

      const errorList = typeof errors === 'string' ? JSON.parse(errors) : errors;

      if (errorList.length === 0) {
        Swal.fire('Succès', 'Tous les résultats ont été importés sans erreur !', 'success');
      } else {
        Swal.fire({
          title: 'Importation partielle',
          html: `<div style="text-align: left; max-height: 200px; overflow-y: auto;">
                  <p>Certaines lignes ont été ignorées :</p>
                  <ul class="text-danger">
                    ${errorList.map((err: string) => `<li>${err}</li>`).join('')}
                  </ul>
                 </div>`,
          icon: 'warning'
        });
      }

      this.loadResultats(this.selectedSessionId!);
      this.selectedFile = null;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.uploading = false;
      Swal.fire('Erreur', 'Échec critique de l\'importation', 'error');
      this.cdr.detectChanges();
    }
  });
}

   }
