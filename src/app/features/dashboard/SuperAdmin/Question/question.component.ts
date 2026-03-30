import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-question',
  standalone: true, // Vérifiez si cette ligne existe
  imports: [CommonModule, FormsModule], // Ajoutez les imports ici
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
/*export class QuestionComponent implements OnInit {
  questions: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  constructor(private service: SuperAdminService) { }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions() {
    this.service.getTenantAdmins().subscribe({ // Adaptez avec votre méthode getQuestions()
      next: (data) => this.questions = data,
      error: (err) => console.error(err)
    });
  }

  onUploadQuestions(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.service.importQuestionsCSV(file).subscribe({
        next: (res) => {
          this.loading = false;
          let msg = `Importation terminée !\n`;
          msg += `✅ Réussites : ${res.successCount}\n`;
          if (res.errorCount > 0) {
            msg += `❌ Ignorées : ${res.errorCount}\nLignes : ${res.ignoredLines.join(', ')}`;
          }
          alert(msg);
          this.loadQuestions(); // Refresh automatique
          event.target.value = '';
        },
        error: (err) => {
          this.loading = false;
          alert("Erreur lors de l'importation.");
          event.target.value = '';
        }
      });
    }
  }

  filteredQuestions() {
    return this.questions.filter(q =>
      q.texte.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      q.categorieQuestion?.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getDifficultyClass(diff: string) {
    switch (diff.toLowerCase()) {
      case 'facile': return 'bg-info text-dark';
      case 'moyenne': return 'bg-warning text-dark';
      case 'difficile': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}*/

export class QuestionComponent implements OnInit {
  questions: any[] = [];
  filteredQuestions: any[] = [];
  categories: any[] = [];
  selectedFilterCat: string = '';
  selectedQuestions: number[] = [];
  loading = false;
  showViewModal = false;
  questionToView: any = null;



    constructor(private service: SuperAdminService, private cdr: ChangeDetectorRef) {}

   ngOnInit() {
       this.refreshAll();
     }

     refreshAll() {
       this.loadCategories();
       this.loadData();
     }
    // 1. Charger les catégories
    loadCategories() {
      this.service.getCatQuestions().subscribe(data => {
        this.categories = [...data]; // Force la nouvelle référence
        this.cdr.detectChanges();
      });
    }

    // 2. Charger les questions
    loadData() {
      this.loading = true;
      this.service.getQuestions().subscribe({
        next: (data) => {
         this.questions = [...data];
                 this.applyFilter();
                 this.loading = false;

                 // 4. Déclencher manuellement la détection de changement
                 this.cdr.detectChanges();
        },
       error: (err) => {
               this.loading = false;
               this.cdr.detectChanges();
             }
           });
    }

    // 3. Appliquer le filtre (Logique de rafraîchissement de la vue)
    applyFilter() {
      if (!this.selectedFilterCat || this.selectedFilterCat === "") {
        this.filteredQuestions = [...this.questions];
      } else {
        this.filteredQuestions = this.questions.filter(q =>
          q.categorieQuestion && q.categorieQuestion.id == this.selectedFilterCat
        );
      }
    this.cdr.detectChanges();
    }

    // 4. L'importation avec refresh garanti
    onUploadQuestions(event: any) {
      const file = event.target.files[0];
      if (!file) return;

      this.loading = true;
      this.cdr.detectChanges();
      this.service.importQuestionsCSV(file).subscribe({
        next: (res) => {
          console.log("Import terminé", res);
          alert(`Succès ! ${res.successCount} questions traitées.`);

          // RESET l'input pour permettre de re-sélectionner le même fichier plus tard
          event.target.value = '';

          // ON RECHARGE TOUT
          this.refreshAll();      // Recharge les questions
        },
        error: (err) => {
          this.loading = false;
          alert("Erreur lors de l'importation");
          event.target.value = '';
          this.cdr.detectChanges();
        }
      });
    }

  getDifficultyClass(diff: string) {
    if (diff === 'facile') return 'bg-success-light';
    if (diff === 'moyenne') return 'bg-warning-light';
    return 'bg-danger-light';
  }

  // --- Gestion des Checkboxes ---
  onCheckboxChange(id: number, event: any) {
    if (event.target.checked) this.selectedQuestions.push(id);
    else this.selectedQuestions = this.selectedQuestions.filter(i => i !== id);
  }

  isAllSelected() {
    return this.filteredQuestions.length > 0 && this.selectedQuestions.length === this.filteredQuestions.length;
  }

  selectAll(event: any) {
    this.selectedQuestions = event.target.checked ? this.filteredQuestions.map(q => q.idQuestion) : [];
  }

  viewQuestion(q: any) {
    this.questionToView = q;
    this.showViewModal = true;
  }
trackByQuestionId(index: number, question: any) {
  return question.idQuestion; // Angular ne redessinera que les lignes modifiées
}
}
