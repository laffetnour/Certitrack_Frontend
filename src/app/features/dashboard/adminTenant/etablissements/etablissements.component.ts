import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-etablissements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './etablissements.component.html',
  styleUrls: ['./etablissements.component.css']
})
export class EtablissementsComponent implements OnInit {

  idTenant: number | null = null;

  userRole: string = '';
  etablissements: any[] = [];

  showModal = false;
  showDeleteModal = false;
  isEditMode = false;
  selectedNom = '';
  selectedId: number | null = null;
  selectedAdresse = '';




  allEtablissements: any[] = [];
  statusFilter: string = "";

  showAlertModal = false;
  alertMessage = '';
  alertTitle = '';

  constructor(private service: AdminTenantService,private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public configService: ConfigService,
    private route: ActivatedRoute) {}



  ngOnInit(): void {

      this.route.parent?.paramMap.subscribe(params => {
        const id = params.get('idTenant');
        if (id) {
          this.idTenant = +id;
        }
        this.loadData();
      });
    }

  loadData() {

      this.service.getEtablissements(this.idTenant).subscribe({
      next: (res) => {
        this.etablissements = [...res];
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement:", err)
    });
  }

loadEtablissements() {
  this.service.getEtablissements().subscribe({
    next: (data) => {
      this.allEtablissements = data;
      this.applyFilter();
    },
    error: (err) => console.error("Erreur chargement:", err)
  });
}

filterByStatus() {
  this.applyFilter();
}

applyFilter() {
  if (!this.statusFilter || this.statusFilter === "") {

    this.etablissements = [...this.allEtablissements];
  } else {

    const wantActive = (this.statusFilter === 'actif');

    this.etablissements = this.allEtablissements.filter(e => {

      return e.statut === wantActive;
    });
  }
  this.cdr.detectChanges();
}
  trackByEtab(index: number, item: any) {
    return item.idEtab;
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedNom = '';
    this.selectedAdresse = '';
    this.showModal = true;
  }

  openEditModal(e: any) {
    this.isEditMode = true;
    this.selectedId = e.idEtab;
    this.selectedNom = e.nom;
    this.selectedAdresse = e.adresse;
    this.showModal = true;
  }


save() {
    console.log("=== Tentative de sauvegarde ===");


    if (!this.selectedNom || this.selectedNom.trim() === '') {
      alert("Le nom de l'établissement est obligatoire.");
      return;
    }


    const payload: any = {
      nom: this.selectedNom.trim(),
      adresse: this.selectedAdresse.trim(),

      statut: true
    };


    if (this.isEditMode) {
      if (!this.selectedId) {
        console.error("Erreur : ID manquant pour la modification");
        return;
      }

      console.log("Action : Modification de l'ID", this.selectedId);

      this.service.updateEtablissement(this.selectedId, payload, this.idTenant).subscribe({
        next: (res) => {
          console.log("✅ Modification réussie :", res);
          this.finaliserAction();
        },
        error: (err) => {
          console.error("❌ Erreur 403 ou autre lors de la modification :", err);
          this.gererErreur(err);
        }
      });

    } else {
      console.log("Action : Création d'un nouvel établissement");

      this.service.createEtablissement(payload, this.idTenant).subscribe({
        next: (res) => {
          console.log("✅ Ajout réussi :", res);
          this.finaliserAction();
        },
        error: (err) => {
          console.error("❌ Erreur 403 ou autre lors de l'ajout :", err);
          this.gererErreur(err);
        }
      });
    }
}


private gererErreur(err: any) {
    if (err.status === 403) {
      alert("Erreur 403 : Vous n'avez pas les permissions ou votre session a expiré.");
    } else {
      alert("Une erreur est survenue lors de la communication avec le serveur.");
    }
}




  private finaliserAction() {
    this.closeModal();
    this.loadData();
  }


  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  toggle(e: any) {

    this.service.toggleEtablissementStatus(e.idEtab, this.idTenant).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error("Erreur toggle:", err)
    });
  }


  closeModal() {
    this.showModal = false;
    this.resetData();
  }

  resetData() {
    this.selectedId = null;
    this.selectedNom = '';
    this.selectedAdresse = '';
    this.isEditMode = false;
  }


selectedIds: Set<number> = new Set<number>();



toggleSelection(id: number) {
  if (this.selectedIds.has(id)) {
    this.selectedIds.delete(id);
  } else {
    this.selectedIds.add(id);
  }
}

toggleAll(event: any) {
  if (event.target.checked) {
    this.etablissements.forEach(e => this.selectedIds.add(e.idEtab));
  } else {
    this.selectedIds.clear();
  }
}

isAllSelected(): boolean {
  return this.etablissements.length > 0 && this.selectedIds.size === this.etablissements.length;
}



bulkToggle(newStatus: boolean) {
  if (this.selectedIds.size === 0) return;

  const ids = Array.from(this.selectedIds);
  console.log("IDs à modifier :", ids);


  const action = newStatus
    ? this.service.activateMultipleEtab(ids, this.idTenant)
    : this.service.deactivateMultipleEtab(ids, this.idTenant);

  action.subscribe({
    next: () => {
      console.log("✅ Action groupée sur établissements réussie");
      this.selectedIds.clear();
      this.loadData();
    },
    error: (err: HttpErrorResponse) => {
      console.error("❌ Erreur lors de l'action groupée :", err);
      alert("Erreur lors de la modification groupée.");
    }
  });
}

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedId = null;
  }


getEtablissementLink(idEtab: number): any[] {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;

  if (role === 'superAdmin' || role === 'SUPER_ADMIN') {
    return [
      '/super-admin',
      'tenant', this.idTenant,
      'etablissement', idEtab,
      'dashboard'
    ];
  }
  return ['/adminTenant', 'etablissement', idEtab, 'dashboard'];
}



  confirmDelete() {

    if (!this.selectedId) return;

    this.service.deleteEtablissement(this.selectedId, this.idTenant)
      .subscribe({


        next: () => {
          this.closeDeleteModal();


          this.alertTitle = 'Succès';
          this.alertMessage = 'Établissement supprimé avec succès.';
          this.showAlertModal = true;

          this.loadData();
          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(err);

          this.closeDeleteModal();

          this.alertTitle = 'Suppression impossible';

          this.alertMessage =
            err.error?.message
            || err.error?.error
            || 'Cet établissement contient des données liées.';


          this.showAlertModal = true;
          this.cdr.detectChanges();
        }

      });

  }

  closeAlertModal() {
    this.showAlertModal = false;
  }


}
