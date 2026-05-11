import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GmetrixService } from '../../../../core/services/gmetrix.service';
import { ContextService } from '../../../../core/services/context.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-gmetrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-gmetrix.component.html',
  styleUrls: ['./import-gmetrix.component.css']
})

export class ImportGmetrixComponent implements OnInit {

  selectedFile!: File;
  scores: any[] = [];
  sessionName: string = '';
  loading = false;
  //sessions: any[] = [];
  //sessionId: number | null = null;
  importResult: any = null;
  showModal = false;



  constructor(private gmetrixService: GmetrixService,
    private cdr: ChangeDetectorRef,
     private auth: AuthService,
        private contextService: ContextService) {}

  ngOnInit(): void {
    //this.loadSessions();
    this.loadScores();

  }
  @ViewChild('fileInput') fileInput!: ElementRef;

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;
    event.target.value = '';

    this.cdr.detectChanges();
  }


  /*upload() {
    if (!this.selectedFile) return;

    this.gmetrixService.importFile(this.selectedFile).subscribe({
      next: (res) => {
        this.importResult = res;
        this.showModal = true;
        this.loadScores();
        this.selectedFile = null as any;
        this.fileInput.nativeElement.value = '';
      },
      error: (err) => {
        this.importResult = {
          success: 0,
          errors: 1,
          errorLines: [err.error]
        };
        this.showModal = true;

        this.selectedFile = null as any;
        this.fileInput.nativeElement.value = '';
      }
    });
  }*/

// --- import-gmetrix.component.ts ---

upload() {
  if (!this.selectedFile) return;

  this.loading = true;
  const currentUser = this.auth.getUser();
  const idEtab = currentUser?.etablissements?.[0]?.id ||
                 currentUser?.etablissements?.[0]?.idEtab ||
                 this.contextService.getEtablissementId();

  this.gmetrixService.importFile(this.selectedFile, idEtab).subscribe({
    next: (res) => {
      this.importResult = res;
      this.showModal = true;
      this.loadScores();
      this.selectedFile = null as any;
      if (this.fileInput) this.fileInput.nativeElement.value = '';
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Erreur import:", err);
      this.importResult = {
        success: 0,
        errors: 1,
        errorLines: [err.error?.message || "Erreur lors de l'importation"]
      };
      this.showModal = true;
      this.loading = false;
       this.selectedFile = null as any;
       this.fileInput.nativeElement.value = '';
      this.cdr.detectChanges();
    }
  });
}

  loadScores() {
    this.loading = true;

    const currentUser = this.auth.getUser();
        const idEtab = currentUser?.etablissements?.[0]?.id || currentUser?.etablissements?.[0]?.idEtab
          || this.contextService.getEtablissementId();

    this.gmetrixService.getScores({},idEtab).subscribe({
      next: (data) => {
        this.scores = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  applyFilters() {
    this.loadScores();
  }

  /*loadSessions() {
    const currentUser = this.auth.getUser();
        const idEtab = currentUser?.etablissements?.[0]?.id || currentUser?.etablissements?.[0]?.idEtab
          || this.contextService.getEtablissementId();
    this.gmetrixService.getSessions(idEtab).subscribe({
      next: (data) => {
        this.sessions = data;
        this.cdr.detectChanges();

      }
    });
  }*/

downloadTemplate() {
    const header = [
            ['#','Test', 'FirstName', 'LastName', 'StudentNumber', 'UserName', 'CompleteDate',
              'Mode','ScorePercent','Score','Classroom','Code','ElapsedTimeSpan']
          ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(header);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_GMetrix');
    XLSX.writeFile(wb, 'Modele_Import_GMetrix.xlsx');
  }

}
