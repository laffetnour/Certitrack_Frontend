import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';

export interface CategorieModule
{
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
  styleUrls: ['../Module/module.component.css']
})

export class CategorieModuleComponent implements OnInit
{
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
  )
  {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void
  {
    this.loadCategories();
  }

  loadCategories(): void
  {
    this.loading = true;

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
          error: (err: any) => {
            const serverMsg = err.error;
            this.handleError(serverMsg);
          }
        });
      } else {
        this.superAdminService.addCategorie(formData).subscribe({
          next: () => this.handleSuccess('Catégorie ajoutée avec succès'),
          error: (err: any) => {
            const serverMsg = err.error;
            this.handleError(serverMsg);
          }
        });
      }
    }
  }

  deleteCategorie(cat: any) {
      if (cat.modules && cat.modules.length > 0) {
        alert("Action impossible : Cette catégorie contient des modules.");
        return;
      }

    if (confirm(`Voulez-vous vraiment supprimer "${cat.nom}" ?`))
    {
      this.superAdminService.deleteCategorie(cat.id).subscribe({
        next: () => {
          this.successMessage = "Supprimé avec succès !";
          this.loadCategories();
        },
        error: (err: any) => {
          if (err.status === 409 || err.status === 400)
          {
            alert(err.error);
          }
          else
          {
            alert("Une erreur est survenue.");
          }
        }
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

  private handleError(msg: string): void
  {
    this.loading = false;

    if (msg.includes("existe déjà")) {
      this.categorieForm.get('nom')?.setErrors({ alreadyExists: msg });
    } else {
      this.errorMessage = msg;
    }

    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
