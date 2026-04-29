import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';

import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-bd-question-list',
  standalone: true,
    imports: [CommonModule, FormsModule],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  moduleId!: number;
  questions: any[] = [];
  selectedIds: number[] = [];
  loading: boolean = false;

  showViewModal: boolean = false;
  questionToView: any = null;

  alertVisible: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  showDeleteModal: boolean = false;
  questionToDelete: any = null;
  isBulkDelete: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private superAdminService: SuperAdminService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id === '0' || id === null || id === undefined) {
      this.moduleId = 0;
    } else {
      this.moduleId = Number(id);
    }

    console.log("Mode détecté, Module ID :", this.moduleId);
    this.loadQuestions();
  });
}

isBehavioralMode(): boolean {
  return !this.moduleId || this.moduleId === 0;
}
loadQuestions(): void {
  this.loading = true;

  if (this.isBehavioralMode()) {
    this.loading = true;
    this.superAdminService.getQuestions().subscribe({
      next: (data: any[]) => {

        this.questions = data.filter(q => q.nature === 'comportementale');
        console.log(this.questions);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  } else {
    this.loading = true;
    this.superAdminService.getByModule(this.moduleId).subscribe({
      next: (data: any[]) => {
        this.questions = data.filter(q => q.nature === 'technique');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}


onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (!file) return;

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'xlsx') {
    alert("Veuillez sélectionner un fichier Excel valide (.xlsx)");
    return;
  }

  this.uploadExcel(file);
}

uploadExcel(file: File): void {
  this.loading = true;

  this.superAdminService.importQuestionsExcel(file, this.moduleId).subscribe({
    next: (res) => {
      let message = `📊 Importation terminée :\n✅ ${res.successCount} questions réussies.`;

      if (res.ignoredLines && res.ignoredLines.length > 0) {
        message += `\n\n⚠️ Lignes ignorées (${res.ignoredLines.length}) : ${res.ignoredLines.join(', ')}`;
        message += `\nVérifiez le format de ces lignes dans votre fichier.`;
      }

      alert(message);
      this.loadQuestions();
      this.loading = false;

      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    },
    error: (err) => {
      console.error("Erreur Import:", err);
      alert("Erreur lors de l'import : Vérifiez que le fichier respecte le modèle Excel et que les colonnes sont correctes.");
      this.loading = false;
    }
  });
}

  toggleSelection(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    }
  }

  isAllSelected(): boolean {
    return this.questions.length > 0 && this.selectedIds.length === this.questions.length;
  }

  selectAll(event: any): void {
    this.selectedIds = event.target.checked ? this.questions.map(q => q.idQuestion) : [];
  }

  goBack(): void {
    this.router.navigate(['/super-admin/modules']);
  }

  openViewModal(q: any) {
      this.questionToView = q;
      this.showViewModal = true;
      this.cdr.detectChanges();
    }

    closeViewModal() {
      this.showViewModal = false;
      this.questionToView = null;
      this.cdr.detectChanges();
    }


  activateSelected(): void {
    if (this.selectedIds.length === 0) return;

    this.superAdminService.activateQuestions(this.selectedIds).subscribe(() => {
      this.selectedIds = [];
      this.loadQuestions();
    });
  }

  deactivateSelected(): void {
    if (this.selectedIds.length === 0) return;

    this.superAdminService.deactivateQuestions(this.selectedIds).subscribe(() => {
      this.selectedIds = [];
      this.loadQuestions();
    });
  }

  toggleStatus(q: any): void {
    this.superAdminService.toggleQuestionStatus(q.idQuestion).subscribe({
      next: (updatedFromServer: any) => {
        this.questions = this.questions.map(item => {
          if (item.idQuestion === q.idQuestion) {
            return { ...item, statut: updatedFromServer.statut };
          }
          return item;
        });

        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur toggle", err)
    });
  }

  trackById(index: number, item: any) {
    return item.idQuestion;
  }

  deleteSingle(id: number): void {
    if (!confirm('Supprimer cette question ?')) return;

    this.superAdminService.deleteQuestion(id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.idQuestion !== id);
        this.showAlert("Question supprimée avec succès", 'success');
        this.cdr.detectChanges();

      },
      error: () => {
        this.showAlert("Impossible de supprimer : question liée à des épreuves", 'error');
      }
    });
  }


  deleteMultiple(): void {
    if (!confirm(`Supprimer ${this.selectedIds.length} questions ?`)) return;

    this.superAdminService.deleteQuestionsBulk(this.selectedIds).subscribe({
      next: (messages: string[]) => {

        this.questions = this.questions.filter(q =>
          !this.selectedIds.includes(q.idQuestion)
        );

        const hasError = messages.some(m => m.includes("liée"));
        const hasSuccess = messages.some(m => m.includes("succès"));

        let type: 'success' | 'error' | 'warning' = 'success';

        if (hasError && hasSuccess) {
          type = 'warning';
        } else if (hasError) {
          type = 'error';
        }

        this.showAlert(messages.join('\n'), type);

        this.selectedIds = [];
      },
      error: () => {
        this.showAlert("Erreur lors de la suppression", 'error');
      }
    });
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning') {
    this.alertMessage = message;
    this.alertType = type;
    this.alertVisible = true;

    setTimeout(() => {
      this.alertVisible = false;
    }, 3000);
  }

  openDeleteModal(q: any) {
    this.questionToDelete = q;
    this.showDeleteModal = true;
  }

  confirmDelete() {

    if (this.isBulkDelete) {

      this.superAdminService.deleteQuestionsBulk(this.selectedIds).subscribe({
        next: (messages: string[]) => {

          const successIds: number[] = [];
          const errorIds: number[] = [];

          messages.forEach(msg => {
            const idMatch = msg.match(/\d+/);
            if (!idMatch) return;

            const id = Number(idMatch[0]);

            if (msg.toLowerCase().includes("succès")) {
              successIds.push(id);
            } else {
              errorIds.push(id);
            }
          });

          this.questions = this.questions.filter(q =>
            !successIds.includes(q.idQuestion)
          );

          this.questions = [...this.questions];

          let message = "";

          if (errorIds.length) {
            message += `❌ ID(s) ${errorIds.join(', ')} liées à des épreuves\n`;
          }

          if (successIds.length) {
            message += `✅ ID(s) ${successIds.join(', ')} supprimées avec succès`;
          }

          const type: 'success' | 'error' | 'warning' =
            errorIds.length && successIds.length ? 'warning' :
              errorIds.length ? 'error' : 'success';

          this.showAlert(message, type);

          this.selectedIds = [];
          this.isBulkDelete = false;
          this.showDeleteModal = false;

          this.cdr.detectChanges();
        },

        error: () => {
          this.showAlert("Erreur lors de la suppression", 'error');
          this.showDeleteModal = false;
        }
      });

      return;
    }

    if (!this.questionToDelete) return;

    this.superAdminService.deleteQuestion(this.questionToDelete.idQuestion).subscribe({
      next: () => {

        this.questions = this.questions.filter(q =>
          q.idQuestion !== this.questionToDelete.idQuestion
        );

        this.questions = [...this.questions];

        this.showDeleteModal = false;
        this.questionToDelete = null;

        this.showAlert("Question supprimée avec succès", 'success');

        this.cdr.detectChanges();
      },

      error: () => {
        this.showDeleteModal = false;
        this.showAlert("Impossible de supprimer : question liée à des épreuves", 'error');
        this.cdr.detectChanges();
      }
    });
  }

  openBulkDeleteModal() {
    if (this.selectedIds.length === 0) return;

    this.isBulkDelete = true;
    this.showDeleteModal = true;
  }

  get selectedQuestions() {
    return this.questions.filter(q => this.selectedIds.includes(q.idQuestion));
  }

downloadTemplate() {
    const header = [
            ['question','image', 'note', 'difficultées', 'choixUnique/choixMultiple', 'reponse']
          ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(header);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Questions');
    XLSX.writeFile(wb, 'Modele_Import_Qustions.xlsx');
  }
}
