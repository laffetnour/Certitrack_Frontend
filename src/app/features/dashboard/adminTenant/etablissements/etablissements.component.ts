import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-etablissements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etablissements.component.html',
  styleUrls: ['./etablissements.component.css']
})
export class EtablissementsComponent implements OnInit {

  etablissements: any[] = [];

  // 🔥 MODALS
  showModal = false;
  showDeleteModal = false;

  // 🔥 MODE
  isEditMode = false;

  // 🔥 DATA
  selectedNom = '';
  selectedId: number | null = null;

  constructor(private service: AdminTenantService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData(); // ✅ suffit
  }

  // ================= LOAD =================
  loadData() {
    this.service.getEtablissements().subscribe({
      next: (res) => {
        // On crée une nouvelle copie propre du tableau
        this.etablissements = [...res];
        // On force la détection de changement
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement:", err)
    });
  }

  trackByEtab(index: number, item: any) {
    return item.idEtab;
  }

  // ================= ADD =================
  openAddModal() {
    this.isEditMode = false;
    this.selectedNom = '';
    this.showModal = true;
  }

  // ================= EDIT =================
  openEditModal(e: any) {
    this.isEditMode = true;
    this.selectedId = e.idEtab;
    this.selectedNom = e.nom;
    this.showModal = true;
  }

  // ================= SAVE =================
  save() {
    console.log("Tentative de sauvegarde...", { mode: this.isEditMode, nom: this.selectedNom, id: this.selectedId });

    if (!this.selectedNom || this.selectedNom.trim() === '') {
      alert("Le nom est obligatoire");
      return;
    }

    // On prépare l'objet à envoyer au backend
    const payload = { nom: this.selectedNom };

    if (this.isEditMode) {
      // MODIFICATION
      if (!this.selectedId) {
        console.error("ID manquant pour la modification");
        return;
      }

      this.service.updateEtablissement(this.selectedId, payload).subscribe({
        next: (res) => {
          console.log("Modification réussie", res);
          this.finaliserAction();
        },
        error: (err) => console.error("Erreur modification:", err)
      });

    } else {
      // AJOUT
      this.service.createEtablissement(payload).subscribe({
        next: (res) => {
          console.log("Ajout réussi", res);
          this.finaliserAction();
        },
        error: (err) => console.error("Erreur ajout:", err)
      });
    }
  }

// Méthode pour centraliser le nettoyage après succès
  private finaliserAction() {
    this.closeModal(); // Ferme la modal et reset les variables
    this.loadData();   // Recharge la liste
  }

  // ================= DELETE =================
  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.service.deleteEtablissement(this.selectedId!).subscribe(() => {
      this.loadData();
      this.cdr.detectChanges();// 🔥
      this.closeDeleteModal();
    });
  }

  // ================= TOGGLE =================
  toggle(e: any) {
    // On passe l'ID de l'objet cliqué explicitement
    this.service.toggleEtablissementStatus(e.idEtab).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error("Erreur toggle:", err)
    });
  }

  // ================= CLOSE =================
  closeModal() {
    this.showModal = false;
    this.resetData(); // ✅ Nettoyer aussi quand on ferme manuellement
  }

  resetData() {
    this.selectedId = null;
    this.selectedNom = '';
    this.isEditMode = false;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedId = null;
  }
}
