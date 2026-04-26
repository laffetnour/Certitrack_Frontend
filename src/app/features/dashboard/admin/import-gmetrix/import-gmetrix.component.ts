import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GmetrixService } from '../../../../core/services/gmetrix.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  // 🔥 SIMPLE FILTER
  sessionName: string = '';

  loading = false;

  sessions: any[] = [];
  sessionId: number | null = null;
  importResult: any = null;
  showModal = false;

  constructor(private gmetrixService: GmetrixService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSessions();
    this.loadScores();

  }
  @ViewChild('fileInput') fileInput!: ElementRef;

  // 📥 FILE
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.selectedFile = file;

    // 🔥 force re-trigger possible même si même fichier
    event.target.value = '';

    this.cdr.detectChanges();
  }

  /*upload() {
    if (!this.selectedFile) return;

    this.gmetrixService.importFile(this.selectedFile).subscribe({
      next: (res) => {
        alert("Import réussi");
        this.loadScores();
        this.cdr.detectChanges();
      },
      error: (err) => alert(err.error)
    });
  }*/

  upload() {
    if (!this.selectedFile) return;

    this.gmetrixService.importFile(this.selectedFile).subscribe({
      next: (res) => {
        this.importResult = res;
        this.showModal = true;
        this.loadScores();

        // 🔥 RESET FILE INPUT (important)
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
  }


  // 📊 LOAD SCORES
  loadScores() {
    this.loading = true;
    console.log("SESSION ID ENVOYÉ =", this.sessionId);

    this.gmetrixService.getScores({
      sessionId: this.sessionId
    }).subscribe({
      next: (data) => {
        this.scores = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  // 🔍 FILTER
  applyFilters() {
    this.loadScores();
  }

  loadSessions() {
    this.gmetrixService.getSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.cdr.detectChanges(); // force refresh UI

      }
    });
  }


}
