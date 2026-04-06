import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tenant.component.html',
  styleUrls: ['../adminTenant/directeurs/directeurs.component.css']
})
export class TenantComponent implements OnInit {
  tenants: any[] = [];
  selectedTenants: number[] = [];
  showModal = false;
  showViewModal = false;
  isEditMode = false;
  selectedTenant: any = null;

  tenantForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';


  filteredTenants: any[] = [];
  statusFilter: string = '';

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
    // Initialisation par précaution
    this.filteredTenants = [];
    this.loadTenants();
  }



  loadTenants(): void {
    this.loading = true;
    this.superAdminService.getTenants().subscribe({
      next: (data: any) => {
        this.tenants = Array.isArray(data) ? [...data] : [];
        this.applyFilter(); // On applique le filtre après le chargement
        this.loading = false;
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

  onStatusFilterChange(event: any): void {
    this.statusFilter = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.statusFilter === '') {
      this.filteredTenants = [...this.tenants];
    } else {
      const boolFilter = this.statusFilter === 'true';
      this.filteredTenants = this.tenants.filter(t => t.statut === boolFilter);
    }
    this.cdr.detectChanges();
  }

  onCheckboxChange(id: number, event: any) {
    if (event.target.checked) {
      this.selectedTenants.push(id);
    } else {
      this.selectedTenants = this.selectedTenants.filter(tId => tId !== id);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedTenants = this.filteredTenants.map(t => t.idTenant);
    } else {
      this.selectedTenants = [];
    }
  }

  isAllSelected() {
    return this.filteredTenants.length > 0 &&
      this.selectedTenants.length === this.filteredTenants.length;
  }



  activateSelected() {
    this.superAdminService.activateTenantsBulk(this.selectedTenants).subscribe({
      next: () => {
        this.handleSuccess('Tenants activés avec succès');
        //this.selectedTenants = [];
        this.selectedTenants = [...this.selectedTenants];
        this.cdr.detectChanges();
      },
      error: () => this.errorMessage = 'Erreur lors de l\'activation'
    });
  }

  deactivateSelected() {
    this.superAdminService.deactivateTenantsBulk(this.selectedTenants).subscribe({
      next: () => {
        this.handleSuccess('Tenants désactivés avec succès');
        //this.selectedTenants = [];
        this.selectedTenants = [...this.selectedTenants];
        this.cdr.detectChanges();
      },
      error: () => this.errorMessage = 'Erreur lors de la désactivation'
    });
  }

  deleteSelected() {
    if (confirm("Voulez-vous vraiment supprimer les tenants sélectionnés ?")) {
      this.superAdminService.deleteTenantsBulk(this.selectedTenants).subscribe({
        next: () => {
          this.handleSuccess('Tenants supprimés avec succès');
          //this.selectedTenants = [];
          this.selectedTenants = [...this.selectedTenants];
          this.cdr.detectChanges();
        },
        error: () => this.errorMessage = 'Erreur lors de la suppression'
      });
    }
  }
}
