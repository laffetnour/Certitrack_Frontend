import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { SuperAdminService } from '../../../../core/services/super-admin.service'; // Votre service mis à jour
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-bd-question-list',
  standalone: true,
    imports: [CommonModule, FormsModule],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  moduleId!: number;
  // Utilisation de any[] pour éviter l'import du modèle
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private superAdminService: SuperAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  /*ngOnInit(): void {
    this.moduleId = Number(this.route.snapshot.paramMap.get('id'));

        if (this.moduleId) {
          this.loadQuestions();
        }

  }*/

 /* loadQuestions(): void {
    this.loading = true;
    this.superAdminService.getByModule(this.moduleId).subscribe({
      next: (data: any[]) => {
        console.log(data);
        //this.questions = data;

        this.questions = data.filter(q => q.nature === 'technique');
        this.cdr.detectChanges();
        this.selectedIds = [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }*/

ngOnInit(): void {
  // On écoute les changements d'URL en temps réel
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');

    // On gère les cas : '0', null ou undefined
    if (id === '0' || id === null || id === undefined) {
      this.moduleId = 0;
    } else {
      this.moduleId = Number(id);
    }

    console.log("Mode détecté, Module ID :", this.moduleId);
    this.loadQuestions(); // On recharge les données à chaque changement d'ID
  });
}

isBehavioralMode(): boolean {
  // On considère que c'est comportemental si l'ID est 0, null ou undefined
  return !this.moduleId || this.moduleId === 0;
}
// Dans ngOnInit ou loadQuestions
loadQuestions(): void {
  this.loading = true;

  if (this.isBehavioralMode()) {
    this.loading = true;
    this.superAdminService.getQuestions().subscribe({ // On récupère toutes les questions
      next: (data: any[]) => {
        // On ne garde QUE les comportementales

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

  // --- ACTIONS ---

  /*onImportCSV(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.loading = true;
      this.superAdminService.importQuestionsCSV(file, this.moduleId).subscribe({
        next: (res) => {
          alert(`${res.successCount} questions importées !`);
          this.loadQuestions();
          this.cdr.detectChanges();
        },
        error: () => alert("Erreur d'import"),
        complete: () => this.loading = false

      });
    }
  }
*/

onImportCSV(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.loading = true;
    this.superAdminService.importQuestionsCSV(file, this.moduleId).subscribe({
      next: (res) => {
        // Construction du message d'alerte
        let message = `${res.successCount} questions importées avec succès !`;

        // Si il y a des lignes ignorées (erreurs)
        if (res.ignoredLines && res.ignoredLines.length > 0) {
          message += `\n\n⚠️ Erreur(s) détectée(s) aux lignes suivantes : ${res.ignoredLines.join(', ')}`;
          message += `\nVérifiez le format de ces lignes (Note, Type ou Réponses).`;
        }

        alert(message);
        this.loadQuestions();
        this.loading = false;
      },
      error: (err) => {
        alert("Erreur critique : Impossible de lire le fichier.");
        this.loading = false;
      }
    });
  }
}
  /*deleteSingle(id: number): void {
    if (confirm('Supprimer cette question ?')) {
      this.superAdminService.deleteQuestion(id).subscribe(() => {
        this.questions = this.questions.filter(q => q.idQuestion !== id);
        this.loadQuestions();

      });
    }
  }*/

  /*deleteMultiple(): void {
    if (confirm(`Supprimer les ${this.selectedIds.length} questions ?`)) {
      this.superAdminService.deleteQuestionsBulk(this.selectedIds).subscribe(() => {
        this.loadQuestions();
      });
    }
  }*/

  // --- GESTION SELECTION ---

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

    // Méthode pour fermer le modal
    closeViewModal() {
      this.showViewModal = false;
      this.questionToView = null;
      this.cdr.detectChanges();
    }


    //ajouter
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
        // On crée un nouveau tableau avec l'objet mis à jour
        this.questions = this.questions.map(item => {
          if (item.idQuestion === q.idQuestion) {
            // On retourne une nouvelle référence d'objet avec le nouveau statut
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

        // 🔥 Détection type message
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

    // 🔥 CAS BULK DELETE
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

          // 🧹 suppression des succès uniquement
          this.questions = this.questions.filter(q =>
            !successIds.includes(q.idQuestion)
          );

          // force refresh Angular (important)
          this.questions = [...this.questions];

          // 🧾 message propre
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

          // reset état
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

    // 🔥 CAS SINGLE DELETE
    if (!this.questionToDelete) return;

    this.superAdminService.deleteQuestion(this.questionToDelete.idQuestion).subscribe({
      next: () => {

        this.questions = this.questions.filter(q =>
          q.idQuestion !== this.questionToDelete.idQuestion
        );

        this.questions = [...this.questions]; // refresh UI

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
}
