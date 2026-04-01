import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DirecteurService } from '../../../../core/services/directeur.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-directeur',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './administrateurs.component.html',
  styleUrls: ['./administrateurs.component.css']
})
export class AdministrateursComponent implements OnInit {

  admins: any[] = [];
  selectedAdmins: number[] = [];


  showModal = false;
  showViewModal = false;
  isEditMode = false;
  selectedAdmin: any = null;

  adminForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  showDeleteModal = false;
  adminToDeleteId: number | null = null;
  constructor(
    private directeurService: DirecteurService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.adminForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      dateNais: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
  }



  loadAdmins(): void {
    this.loading = true;
    this.directeurService.getAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }



  toggleStatus(admin: any): void {

    if (!admin || !admin.id) {
      console.error("Admin invalide");
      return;
    }

    console.log("Clique sur admin ID:", admin.id);

    this.directeurService.toggleAdminStatus(admin.id).subscribe({
      next: () => {


        this.loadAdmins();

        this.successMessage = admin.statut
          ? "Administrateur désactivé avec succès"
          : "Administrateur activé avec succès";

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error("Erreur toggle:", err);
        this.errorMessage = "Erreur lors du changement de statut";
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }


  deleteAdmin(id: number): void {
    this.adminToDeleteId = id;
    this.showDeleteModal = true;
  }


  confirmDelete(): void {

    if (!this.adminToDeleteId) return;

    this.directeurService.deleteAdmin(this.adminToDeleteId).subscribe({
      next: () => {
        this.successMessage = "Administrateur supprimé avec succès";
        this.loadAdmins();
        this.showDeleteModal = false;
        this.adminToDeleteId = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = "Erreur lors de la suppression";
        this.showDeleteModal = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.adminToDeleteId = null;
  }




  onCheckboxChange(id: number, event: any): void {
    if (event.target.checked) {
      if (!this.selectedAdmins.includes(id)) this.selectedAdmins.push(id);
    } else {
      this.selectedAdmins = this.selectedAdmins.filter(i => i !== id);
    }
  }

  selectAll(event: any): void {
    if (event.target.checked) {
      this.selectedAdmins = this.admins.map(a => a.id);
    } else {
      this.selectedAdmins = [];
    }
  }

  isAllSelected(): boolean {
    return this.admins.length > 0 && this.selectedAdmins.length === this.admins.length;
  }



  activateSelected(): void {
    if (this.selectedAdmins.length === 0) return;
    this.directeurService.activateMultiple(this.selectedAdmins).subscribe({
      next: () => {
        this.successMessage = 'Admins activés';
        this.selectedAdmins = [];
        this.loadAdmins();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'activation';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  deactivateSelected(): void {
    if (this.selectedAdmins.length === 0) return;
    this.directeurService.deactivateMultiple(this.selectedAdmins).subscribe({
      next: () => {
        this.successMessage = 'Admins désactivés';
        this.selectedAdmins = [];
        this.loadAdmins();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la désactivation';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  deleteSelected(): void {
    if (this.selectedAdmins.length === 0) return;
    if (!confirm('Supprimer les administrateurs sélectionnés ?')) return;
    this.directeurService.deleteMultiple(this.selectedAdmins).subscribe({
      next: () => {
        this.successMessage = 'Admins supprimés';
        this.selectedAdmins = [];
        this.loadAdmins();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }




  openAddModal(): void {
    this.showModal = true;
    this.isEditMode = false;
    this.adminForm.reset();
  }


  openEditModal(admin: any): void {
    this.selectedAdmin = { ...admin }; // ← Copie
    this.showModal = true;
    this.isEditMode = true;
    const formattedDate = admin.dateNais
      ? admin.dateNais.toString().substring(0,10)
      : '';

    this.adminForm.patchValue({
      nom: admin.nom,
      prenom: admin.prenom,
      username: admin.username,
      dateNais: formattedDate,
      password: ''
    });
    this.adminForm.markAsPristine();
  }

  viewAdmin(admin: any): void {
    this.selectedAdmin = admin;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
     this.errorMessage = '';
    this.adminForm.reset();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedAdmin = null;
  }


  onSubmit(): void {

    if (this.adminForm.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const data = this.adminForm.value;

    if (this.isEditMode && this.selectedAdmin) {

      this.directeurService.updateAdmin(this.selectedAdmin.id, data).subscribe({
        next: () => {
          this.successMessage = 'Admin modifié avec succès';
          this.loadAdmins();
          this.closeModal();
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = "Erreur lors de la modification";
          this.loading = false;
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });

    } else {

      this.directeurService.createAdmin(data).subscribe({
        next: () => {
          this.successMessage = 'Admin ajouté avec succès';
          this.loadAdmins();
          this.closeModal();
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {

          this.loading = false;
          if (err.status === 400) {
            this.errorMessage = err.error?.message || "Cet utilisateur existe déjà (email dupliqué)";
          } else {
            this.errorMessage = "Erreur lors de l'ajout";
          }


          this.cdr.detectChanges();
        }
      });

    }
  }


}

