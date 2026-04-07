import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminService } from '../../../core/services/super-admin.service';

@Component({
  selector: 'app-liste-admins-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listeAdminTenant.component.html',
  styleUrls: ['../adminTenant/directeurs/directeurs.component.css']
})
export class ListeAdminsTenantComponent implements OnInit {
  admins: any[] = [];
  tenants: any[] = [];
  filteredAdmins: any[] = [];
  showModal = false;
  showViewModal = false;
  isEditMode = false;
  selectedAdmin: any = null;
  selectedAdminIds: number[] = [];
  adminForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  filteredTenants: any[] = [];

  statusFilter: string = '';

  selectedTenantId: number | null = null;
  selectedStatus: boolean | null = null;
  selectedTenantStatus: boolean | null = null;

  constructor(
    private superAdminService: SuperAdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.adminForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateNais: ['', Validators.required],
      tenantId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
    this.loadTenants();
  }

  loadAdmins(): void {
    this.loading = true;
    this.superAdminService.getTenantAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        this.filteredAdmins = [...data];;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur de chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTenants(): void {
    this.superAdminService.getTenants().subscribe(data => {
      this.tenants = data;
      this.filteredTenants = [...data];

      this.cdr.detectChanges();
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedAdmin = null;
    this.adminForm.reset();

    this.adminForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.adminForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  filterByTenant(event: any): void {
    const selectedNom = event.target.value;
    if (selectedNom === 'ALL') {
      this.filteredAdmins = [...this.admins];
    } else {

      this.filteredAdmins = this.admins.filter(a => a.nomTenant === selectedNom);
    }
    this.cdr.detectChanges();
  }
  openEditModal(admin: any): void {
    this.isEditMode = true;
    this.selectedAdmin = admin;
    const tenantTrouve = this.tenants.find(t => t.nom === admin.nomTenant);
    const idToPatch = tenantTrouve ? tenantTrouve.idTenant : '';


    this.adminForm.get('password')?.clearValidators();
    this.adminForm.get('password')?.updateValueAndValidity();

    const formattedDate = admin.dateNais ? admin.dateNais.toString().substring(0, 10) : '';

    this.adminForm.patchValue({
      nom: admin.nom,
      prenom: admin.prenom,
      username: admin.username,
      dateNais: formattedDate,
      tenantId: idToPatch
    });

    this.showModal = true;
    this.cdr.detectChanges();
  }

  viewAdmin(admin: any): void {
    this.selectedAdmin = admin;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.showViewModal = false;
    this.selectedAdmin = null;
  }

  onSubmit(): void {
    if (this.adminForm.valid) {
      this.loading = true;
      const formData = this.adminForm.value;

      if (this.isEditMode) {

        this.superAdminService.updateUser(this.selectedAdmin.id, formData).subscribe({
          next: () => this.handleSuccess('Administrateur mis à jour'),
          error: () => this.handleError('Erreur lors de la modification')
        });
      } else {
        this.superAdminService.addUser(formData).subscribe({
          next: () => this.handleSuccess('Créé avec succès'),
          error: () => this.handleError('Erreur lors de l ajout')
        });
      }
    }
  }

  toggleStatus(admin: any): void {
    this.superAdminService.toggleStatus(admin.id).subscribe({
      next: () => {
        admin.statut = !admin.statut;
        this.successMessage = admin.statut ? 'Administrateur activé' : 'Administrateur désactivé';
        this.cdr.detectChanges();
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Supprimer cet administrateur ?')) {
      this.superAdminService.deleteUser(id).subscribe({
        next: () => this.handleSuccess('Utilisateur supprimé'),
        error: () => this.handleError('Erreur lors de la suppression')
      });
    }
  }

  private handleSuccess(msg: string): void {
    this.successMessage = msg;
    this.loading = false;
    this.closeModal();
    this.loadAdmins();
    setTimeout(() => this.successMessage = '', 3000);
  }




  private handleError(msg: string): void {
    this.errorMessage = msg;
    this.loading = false;
    setTimeout(() => this.errorMessage = '', 3000);
  }

  onTenantStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    if (value === 'true') this.selectedTenantStatus = true;
    else if (value === 'false') this.selectedTenantStatus = false;
    else this.selectedTenantStatus = null;


    this.filteredTenants = this.selectedTenantStatus !== null
      ? this.tenants.filter(t => t.statut === this.selectedTenantStatus)
      : [...this.tenants];

    this.selectedTenantId = null;

    this.filterAdmins();
  }

  onTenantChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    this.selectedTenantId = value ? +value : null;

    this.filterAdmins();
  }




  filterAdmins(): void {
    const params: any = {};

    if (this.selectedTenantStatus !== null) params.tenantStatut = this.selectedTenantStatus;
    if (this.selectedTenantId) params.tenantId = this.selectedTenantId;

    this.superAdminService.getFilteredTenantAdminsByTenantStatus(params).subscribe({
      next: data => {
        this.filteredAdmins = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.filteredAdmins = [];
        this.errorMessage = 'Erreur lors du filtrage';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
  isTenantActive(admin: any): boolean {
    const tenant = this.tenants.find(t => t.nom === admin.nomTenant);
    return tenant ? tenant.statut : false;
  }



  isBulkActionAllowed(): boolean {

    if (this.selectedAdminIds.length === 0) return false;

    const selectedAdminsObjects = this.filteredAdmins.filter(admin =>
      this.selectedAdminIds.includes(admin.id)
    );

    const hasInactiveTenantSelected = selectedAdminsObjects.some(admin => !this.isTenantActive(admin));


    return !hasInactiveTenantSelected;
  }


  onCheckboxChange(id: number, event: any) {
    if (event.target.checked) {
      this.selectedAdminIds.push(id);
    } else {
      this.selectedAdminIds = this.selectedAdminIds.filter(adminId => adminId !== id);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedAdminIds = this.filteredAdmins.map(a => a.id);
    } else {
      this.selectedAdminIds = [];
    }
  }

  isAllSelected() {
    return this.filteredAdmins.length > 0 && this.selectedAdminIds.length === this.filteredAdmins.length;
  }


  activateSelected() {
    this.superAdminService.activateUsersBulk(this.selectedAdminIds).subscribe(() => {
      this.handleSuccess('Admins activés');
      this.selectedAdminIds = [];
    });
  }

  deactivateSelected() {
    this.superAdminService.deactivateUsersBulk(this.selectedAdminIds).subscribe(() => {
      this.handleSuccess('Admins désactivés');
      this.selectedAdminIds = [];
    });
  }

  deleteSelected() {
    if(confirm("Supprimer les éléments sélectionnés ?")) {
      this.superAdminService.deleteUsersBulk(this.selectedAdminIds).subscribe(() => {
        this.handleSuccess('Admins supprimés');
        this.selectedAdminIds = [];
      });
    }
  }

  protected readonly HTMLSelectElement = HTMLSelectElement;
}
