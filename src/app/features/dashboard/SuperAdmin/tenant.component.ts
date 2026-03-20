import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminService } from '../../../core/services/super-admin.service'; // Ajuste le chemin selon ton projet

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tenant.component.html',
  styleUrls: ['./superAdmin.component.css']
})
export class TenantComponent implements OnInit {
  tenants: any[] = [];
  selectedTenants: number[] = []; // Pour une future sélection multiple si besoin
  showModal = false;
  showViewModal = false;
  isEditMode = false;
  selectedTenant: any = null;

  tenantForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private superAdminService: SuperAdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.tenantForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      statut: [true]
    });
  }

  ngOnInit(): void {
    console.log("TenantComponent chargé");
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.superAdminService.getTenants().subscribe({
      next: (data: any) => {
        console.log('Données reçues:', data);

        // On s'assure que tenants est toujours un tableau
        // L'opérateur [...] crée une nouvelle instance de tableau
        this.tenants = Array.isArray(data) ? [...data] : [];

        this.loading = false;
        // On force Angular à vérifier la vue immédiatement
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedTenant = null;
    this.tenantForm.reset({ statut: true });
    this.showModal = true;
  }

  openEditModal(tenant: any): void {
    this.isEditMode = true;
    this.selectedTenant = tenant;

    this.tenantForm.patchValue({
      nom: tenant.nom,
      statut: tenant.statut
    });

    this.tenantForm.markAsPristine();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  viewTenant(tenant: any): void {
    this.selectedTenant = tenant;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTenant = null;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTenant = null;
  }

  onSubmit(): void {
    if (this.tenantForm.valid) {
      this.loading = true;
      const formData = this.tenantForm.value;

      if (this.isEditMode) {
        this.superAdminService.updateTenant(this.selectedTenant.idTenant, formData).subscribe({
          next: () => {
            this.handleSuccess('Tenant modifié avec succès');

          },
          error: () => {
            this.errorMessage = 'Erreur lors de la modification';
            this.loading = false;
          }
        });
      } else {
        this.superAdminService.addTenant(formData).subscribe({
          next: () => {
            this.handleSuccess('Tenant ajouté avec succès');
          },
          error: () => {
            this.errorMessage = 'Erreur lors de l\'ajout';
            this.loading = false;
          }
        });
      }
    }
  }

  toggleStatus(tenant: any): void {
    this.superAdminService.toggleTenantStatus(tenant.idTenant).subscribe({
      next: () => {
        this.loadTenants();
        this.successMessage = tenant.statut ? 'Tenant désactivé' : 'Tenant activé';
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur changement de statut';
        this.cdr.detectChanges();
      }
    });
  }

  deleteTenant(id: number): void {
    if (confirm('Supprimer ce tenant ?')) {
      this.superAdminService.deleteTenant(id).subscribe({
        next: () => {
          this.handleSuccess('Tenant supprimé');
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la suppression';
        }
      });
    }
  }

  private handleSuccess(msg: string): void {
    this.successMessage = msg;
    this.closeModal();

    // Très important : On recharge la liste APRES l'ajout réussi
    this.loadTenants();

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
