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
      statut: [true],
      logo: [''],
      banniere: ['']
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


/*deleteTenant(id: number): void {
  // 1. Trouver l'objet tenant correspondant à l'ID
  const tenantToDelete = this.tenants.find(t => t.idTenant === id);

  // 2. Vérifier s'il contient des établissements
  if (tenantToDelete && tenantToDelete.etablissements && tenantToDelete.etablissements.length > 0) {
    const nbEtab = tenantToDelete.etablissements.length;
    alert(`Impossible de supprimer : Ce tenant possède ${nbEtab} établissement(s). Veuillez supprimer les établissements d'abord.`);
    return; // On arrête l'exécution ici
  }

  // 3. Si pas d'établissements, on procède à la confirmation habituelle
  if (confirm('Êtes-vous sûr de vouloir supprimer ce tenant ? Cette action est irréversible.')) {
    this.superAdminService.deleteTenant(id).subscribe({
      next: () => {
        this.handleSuccess('Tenant supprimé avec succès');
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression. Vérifiez les dépendances.';
        console.error(err);
      }
    });
  }
}*/
deleteTenant(id: number): void {
  const tenantToDelete = this.tenants.find(t => t.idTenant === id);
  if (!tenantToDelete) return;

  // 1. Vérification préventive côté Front (pour les établissements qui sont déjà chargés)
  if (tenantToDelete.etablissements && tenantToDelete.etablissements.length > 0) {
    alert(`Interdit : Il y a ${tenantToDelete.etablissements.length} établissement(s).`);
       this.loadTenants();
       this.cdr.detectChanges();
    return;
  }

  // 2. Si le front pense que c'est vide, on demande confirmation
  if (confirm(`Êtes-vous sûr de vouloir supprimer le tenant "${tenantToDelete.nom}" ?`)) {
    this.loading = true;
    this.superAdminService.deleteTenant(id).subscribe({
      next: () => {
        this.handleSuccess('Tenant supprimé avec succès');
        this.loading = false;
        this.loadTenants();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;

        // 3. On gère les messages d'erreur envoyés par le Backend
        if (err.status === 403) { // Forbidden
          alert(err.error || `Interdit : Il y a des établissements rattachés.`);
          this.loadTenants();
          this.cdr.detectChanges();
        }
        else if (err.status === 409) { // Conflict
          alert("Veuillez supprimer les modules tenant de ce tenant d'abord.");
          this.loadTenants();
          this.cdr.detectChanges();
        }
        else {
          this.errorMessage = 'Une erreur technique est survenue.';
          alert("Erreur : Impossible de supprimer ce tenant. Vérifiez les dépendances SQL.");
          this.loadTenants();
          this.cdr.detectChanges();
        }
        console.error(err);
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
  if (this.selectedTenants.length === 0) return;

  // 1. Filtre sur ce que le Front connaît (les établissements)
  const aSupprimer = this.tenants.filter(t =>
    this.selectedTenants.includes(t.idTenant) && (!t.etablissements || t.etablissements.length === 0)
  );

  const interditsEtab = this.tenants.filter(t =>
    this.selectedTenants.includes(t.idTenant) && t.etablissements && t.etablissements.length > 0
  );

  console.log("interditsEtab : ", interditsEtab);

  let messageInterdit = "";
  if (interditsEtab.length > 0) {
    messageInterdit = "\n\n🚫 Suppression impossible (Etablissements présents) :\n" +
      interditsEtab.map(t => `- ${t.nom}`).join("\n");
  }

  if (aSupprimer.length === 0) {
    alert("Opération annulée : Aucun des tenants sélectionnés ne peut être supprimé." + messageInterdit);
    return;
  }

  // 2. Confirmation pour les tenants qui semblent "vides"
  const noms = aSupprimer.map(t => t.nom).join(", ");
  if (confirm(`Voulez-vous supprimer ces tenants : ${noms} ?` + messageInterdit)) {
    this.loading = true;
    const ids = aSupprimer.map(t => t.idTenant);

    this.superAdminService.deleteTenantsBulk(ids).subscribe({
      next: () => {

        this.handleSuccess('Tenant supprimé avec succès');
        this.selectedTenants = [];


      },
      error: (err) => {
        this.loading = false;
        console.log("Statut de l'erreur reçu :", err.status);
        console.log("Corps de l'erreur :", err.error);

        if (err.status === 403) {
          alert("🚫 Action refusée : Certains établissements sont encore rattachés à ces tenants.");

        }
        else if (err.status === 409) {
                alert("❌ Suppression impossible : Certains tenants sélectionnés possèdent encore des modules dans leur catalogue.\n\nVeuillez vider les modules de ces tenants d'abord.");

              }
        else {
          alert("⚠️ Une erreur technique est survenue lors de la suppression groupée.");

        }

        // On recharge la liste pour voir quels tenants ont pu être supprimés (si le bulk est partiel)
        this.loadTenants();
        this.cdr.detectChanges();
      }
    });
  }
}

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.tenantForm.patchValue({
        [field]: reader.result // base64
      });
    };

    reader.readAsDataURL(file);
  }

}
