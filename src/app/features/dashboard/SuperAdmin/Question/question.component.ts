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
  showModal = false;
  isEditMode = false;
  currentQuestion: any = null;
  showDeleteModal = false;
  idToDelete: number | null = null;


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

//******

  toggleStatus(q: any) {
    this.service.toggleQuestionStatus(q.idQuestion).subscribe({
      next: () => {
        this.refreshAll(); // 🔥 IMPORTANT
      },
      error: (err) => console.error(err)
    });
  }

  deleteQuestion(id: number) {
    if (confirm("Supprimer cette question ?")) {
      this.service.deleteQuestion(id).subscribe(() => this.refreshAll());
    }
  }

  activateSelected() {
    this.service.activateQuestions(this.selectedQuestions)
      .subscribe(() => this.refreshAll());
  }

  deactivateSelected() {
    this.service.deactivateQuestions(this.selectedQuestions)
      .subscribe(() => this.refreshAll());
  }

  deleteSelected() {
    if (confirm("Supprimer les questions sélectionnées ?")) {
      this.service.deleteQuestionsBulk(this.selectedQuestions)
        .subscribe(() => this.refreshAll());
    }
  }






 /* openDeleteModal(id: number) {
    if (confirm("Supprimer cette question ?")) {
      this.deleteQuestion(id);
    }
  }*/

  closeModal() {
    this.showModal = false;
  }

  addReponse() {
    this.currentQuestion.reponses.push({ texte: '', score: 0 });
  }

  removeReponse(index: number) {
    this.currentQuestion.reponses.splice(index, 1);
  }

 /* saveQuestion() {
    if (!this.currentQuestion.categorieQuestion) {
      alert("Veuillez choisir une catégorie !");
      return;
    }

    // Préparation de l'objet propre pour le backend
    const payload = {
      ...this.currentQuestion,
      // On s'assure que chaque réponse a son texte et son score converti
      reponses: this.currentQuestion.reponses.map((r: any) => ({
        texte: r.texte,
        score: parseFloat(r.score)
      })),
      // On envoie l'objet catégorie avec l'ID attendu par Hibernate
      categorieQuestion: {
        id: this.currentQuestion.categorieQuestion.id
      }
    };

    if (this.isEditMode) {
      this.service.updateQuestion(this.currentQuestion.idQuestion, payload)
        .subscribe({
          next: () => { this.closeModal(); this.refreshAll(); },
          error: (err) => alert("Erreur lors de la modification")
        });
    } else {
      this.service.addQuestion(payload) // On envoie le payload nettoyé
        .subscribe({
          next: () => { this.closeModal(); this.refreshAll(); },
          error: (err) => {
            //console.error(err); // Regarde la console (F12) pour voir l'erreur précise
            alert("Erreur lors de l'ajout");
          }
        });
    }
  }*/


  saveQuestion() {
    // 1. Validation simple
    if (!this.currentQuestion.categorieQuestion || !this.currentQuestion.categorieQuestion.id) {
      alert("Erreur : Veuillez sélectionner une catégorie valide !");
      return;
    }

    // 2. Construction du payload "propre" pour Spring Boot
    const questionToSave = {
      texte: this.currentQuestion.texte,
      image: this.currentQuestion.image,
      difficultee: this.currentQuestion.difficultee,
      type: this.currentQuestion.type,
      // On envoie juste l'ID attendu par ton service Java
      categorieQuestion: {
        id: Number(this.currentQuestion.categorieQuestion.id)
      },
      // On s'assure que les scores sont des nombres
      reponses: this.currentQuestion.reponses.map((r: any) => ({
        texte: r.texte,
        score: parseFloat(r.score) || 0
      }))
    };

    if (this.isEditMode) {
      this.service.updateQuestion(this.currentQuestion.idQuestion, questionToSave).subscribe({
        next: () => { this.closeModal(); this.refreshAll(); },
        error: (err) => alert("Erreur modification : " + err.message)
      });
    } else {
      this.service.addQuestion(questionToSave).subscribe({
        next: () => { this.closeModal(); this.refreshAll(); },
        error: (err) => alert("Erreur ajout : " + err.message)
      });
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentQuestion = {
      texte: '',
      difficultee: 'facile',
      type: 'choixUnique',
      categorieQuestion: null,
      image: '',
      reponses: [
        { texte: '', score: 0 } // 🔥 au moins une
      ]
    };
    this.showModal = true;
  }

  openEditModal(q: any) {
    this.isEditMode = true;
    this.currentQuestion = JSON.parse(JSON.stringify(q)); // clone
    this.showModal = true;
  }

  openDeleteModal(id: number) {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (this.idToDelete != null) {
      this.service.deleteQuestion(this.idToDelete)
        .subscribe(() => {
          this.closeDeleteModal();
          this.refreshAll();
        });
    }
  }

  bulkToggle(desactive: boolean) {
    if (this.selectedQuestions.length === 0) return;

    const request = desactive
      ? this.service.deactivateQuestions(this.selectedQuestions)
      : this.service.activateQuestions(this.selectedQuestions);

    request.subscribe(() => {
      this.selectedQuestions = [];
      this.refreshAll();
    });
  }

  bulkDelete() {
    if (this.selectedQuestions.length === 0) return;

    if (confirm("Supprimer les questions sélectionnées ?")) {
      this.service.deleteQuestionsBulk(this.selectedQuestions)
        .subscribe(() => {
          this.selectedQuestions = [];
          this.refreshAll();
        });
    }
  }

  compareCategories(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}
