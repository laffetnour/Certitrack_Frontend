import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Ajout de ChangeDetectorRef
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cat-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catQuestion.component.html',
  styleUrls: ['.././superAdmin.component.css']
})
export class CatQuestionComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  showModal = false;
  isEditMode = false;
  currentId: number | null = null;
  categorieForm: FormGroup;

  successMessage = '';
  errorMessage = '';

  // 2. Injecter cdr
  constructor(
    private service: SuperAdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.cdr.detectChanges(); // Force le spinner à apparaître

    this.service.getCatQuestions().subscribe({
      next: (data) => {
        // 3. On crée une nouvelle référence d'array pour déclencher la détection
        this.categories = [...data];
        this.loading = false;
        this.cdr.detectChanges(); // Force le rafraîchissement de la table
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
        this.cdr.detectChanges();
      }
    });
  }

 openAddModal() {
     this.isEditMode = false;
     this.currentId = null;
     this.categorieForm.reset();
     this.showModal = true;
   }

   openEditModal(cat: any) {
     this.isEditMode = true;
     this.currentId = cat.id;
     this.categorieForm.patchValue({
       nom: cat.nom,
       description: cat.description
     });
     this.showModal = true;
   }

   closeModal() {
     this.showModal = false;
     this.errorMessage = '';
   }

  onSubmit() {
    if (this.categorieForm.invalid) return;

    this.loading = true;
    const val = this.categorieForm.value;

    if (this.isEditMode && this.currentId) {
      this.service.updateCatQuestion(this.currentId, val).subscribe({
        next: () => this.handleSuccess('Catégorie mise à jour !'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.service.addCatQuestion(val).subscribe({
        next: () => this.handleSuccess('Catégorie créée avec succès !'),
        error: (err) => this.handleError(err)
      });
    }
  }


deleteCategorie(cat: any) { // On passe l'objet entier au lieu de l'ID
  // Vérification locale
  if (cat.questions && cat.questions.length > 0) {
    alert("Action refusée : Cette catégorie n'est pas vide. Supprimez les questions liées avant de continuer.");
    return; // On arrête tout ici
  }

  // Si elle est vide, on procède à la suppression habituelle
  if (confirm(`Supprimer la catégorie ${cat.nom} ?`)) {
    this.service.deleteCatQuestion(cat.id).subscribe({
      next: () => {
        this.successMessage = 'Supprimé !';
        this.loadCategories();
      }
    });
  }
}

  private handleSuccess(msg: string) {
    this.successMessage = msg;
    this.loading = false;
    this.showModal = false; // On ferme la modal
    this.loadCategories();  // On recharge la liste

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  private handleError(err: any) {
    this.loading = false;
    this.errorMessage = err.error || "Une erreur est survenue";
    this.cdr.detectChanges();
  }
}
