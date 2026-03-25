import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';

export interface CategorieModule {
  id?: number;
  nom: string;
  description: string;
  modules?: any[];
}

@Component({
  selector: 'app-categorie-module',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categorie-module.component.html',
  styleUrls: ['.././superAdmin.component.css'] // Utilise le même CSS pour la cohérence
})

export class CategorieModuleComponent implements OnInit {
  categories: any[] = [];
  showModal = false;
  isEditMode = false;
  selectedCategorie: any = null;

  categorieForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private superAdminService: SuperAdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

loadCategories(): void {
  this.loading = true;
  // Précise le type attendu dans l'Observable
  this.superAdminService.getCategories().subscribe({
    next: (data: CategorieModule[]) => {
      this.categories = data;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err: Error) => {
      console.error(err);
      this.loading = false;
    }
  });
}

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCategorie = null;
    this.categorieForm.reset();
    this.showModal = true;
  }

  openEditModal(cat: any): void {
    this.isEditMode = true;
    this.selectedCategorie = cat;
    this.categorieForm.patchValue({
      nom: cat.nom,
      description: cat.description
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCategorie = null;
  }

  onSubmit(): void {
    if (this.categorieForm.valid) {
      this.loading = true;
      const formData = this.categorieForm.value;

      if (this.isEditMode) {
        this.superAdminService.updateCategorie(this.selectedCategorie.id, formData).subscribe({
          next: () => this.handleSuccess('Catégorie modifiée avec succès'),
          error: () => this.handleError('Erreur lors de la modification')
        });
      } else {
        this.superAdminService.addCategorie(formData).subscribe({
          next: () => this.handleSuccess('Catégorie ajoutée avec succès'),
          error: () => this.handleError('Erreur lors de l\'ajout')
        });
      }
    }
  }

  deleteCategorie(id: number): void {
    if (confirm('Supprimer cette catégorie ? Cela peut affecter les modules liés.')) {
      this.superAdminService.deleteCategorie(id).subscribe({
        next: () => this.handleSuccess('Catégorie supprimée'),
        error: () => this.handleError('Erreur lors de la suppression')
      });
    }
  }

  private handleSuccess(msg: string): void {
    this.successMessage = msg;
    this.closeModal();
    this.loadCategories();
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  private handleError(msg: string): void {
    this.errorMessage = msg;
    this.loading = false;
    this.cdr.detectChanges();
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
