
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';

@Component({
  selector: 'app-directeurs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './directeurs.component.html',
  styleUrls: ['./directeurs.component.css']
})
export class DirecteursComponent implements OnInit {
  directeurs: any[] = [];      // Liste affichée dans le tableau
  allDirecteurs: any[] = [];   // Copie de sauvegarde pour le filtrage
  etablissements: any[] = [];

  selectedDirecteurs: number[] = [];
  activeEtablissements: any[] = [];

  showDeleteModal = false;
  directeurToDeleteId: number | null = null;

  selectedEtablissement: any = ""; // Pour le [(ngModel)] du filtre
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedDirecteur: any;
  showViewModal = false;
  directeurForm!: FormGroup;
  statusFilter: string = ""; // Variable pour stocker le choix du select

  constructor(
    private service: AdminTenantService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

loadData() {
  this.loading = true;
  this.service.getEtablissements().subscribe({
    next: (etabs) => {
    this.etablissements = etabs;

          // 2. Liste filtrée pour le FORMULAIRE (Uniquement les actifs)
    this.activeEtablissements = etabs.filter((e: any) => e.statut === true);

      this.service.getDirecteurs().subscribe({
        next: (res) => {
          console.log("Données reçues :", res);
          this.allDirecteurs = res || [];
          this.directeurs = [...this.allDirecteurs]; // Initialise la liste affichée
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur 403 ou autre sur les directeurs :", err);
          this.loading = false;
        }
      });
    },
    error: (err) => console.error("Erreur établissements :", err)
  });
}

/*

filterByStatus() {
  if (!this.statusFilter || this.statusFilter === "") {
    this.directeurs = [...this.allDirecteurs];
  } else {
    const wantActive = (this.statusFilter === 'actif');

    this.directeurs = this.allDirecteurs.filter(d => {
      if (d.etablissements && d.etablissements.length > 0) {
        const idDeLEtab = d.etablissements[0].id;

        // On cherche l'établissement correspondant dans notre liste globale d'etablissements
        const etabComplet = this.etablissements.find(e => e.idEtab === idDeLEtab);

        // Si on le trouve, on compare son statut
        if (etabComplet) {
          return etabComplet.statut === wantActive;
        }
      }
      return false;
    });
  }
  this.cdr.detectChanges();
}

filterByEtablissement() {
  const selectedId = this.selectedEtablissement;
  console.log("Filtrage pour ID :", selectedId);

  if (!selectedId || selectedId === "" || selectedId === "null") {
    this.directeurs = [...this.allDirecteurs];
  } else {
    this.directeurs = this.allDirecteurs.filter(d => {
      // On cherche dans la liste d'établissements renvoyée par ton UserReponse Java
      return d.etablissements && d.etablissements.some((e: any) => e.id == selectedId);
    });
  }
  console.log("Résultat :", this.directeurs.length, "trouvés");
  this.cdr.detectChanges();
}*/

// Vérifie si l'établissement lié au directeur est actif
isEtablissementActive(d: any): boolean {
  // 1. On vérifie si le directeur a une liste d'établissements
  if (!d.etablissements || d.etablissements.length === 0) return false;

  // 2. On récupère l'ID de son établissement (ex: 3)
  const idDeLEtab = d.etablissements[0].id;

  // 3. On cherche cet ID dans la liste complète chargée au ngOnInit
  const etabComplet = this.etablissements.find(e => e.idEtab === idDeLEtab);

  // 4. On retourne son statut (true ou false)
  return etabComplet ? etabComplet.statut === true : false;
}
isBulkActionAllowed(): boolean {
  if (this.selectedDirecteurs.length === 0) return false;

  // On vérifie pour chaque ID sélectionné
  return this.selectedDirecteurs.every(id => {
    // 1. Trouver l'objet directeur complet
    const d = this.allDirecteurs.find(dir => dir.id === id);
    if (!d || !d.etablissements || d.etablissements.length === 0) return false;

    // 2. Trouver le statut de son établissement dans la liste globale
    const idEtab = d.etablissements[0].id;
    const etab = this.etablissements.find(e => e.idEtab === idEtab);

    // 3. Retourne true si l'établissement est actif
    return etab ? etab.statut === true : false;
  });
}

// Cette fonction unique gère les deux critères en même temps
applyFilters() {
  // 1. On repart toujours de la liste complète originale
  let result = [...this.allDirecteurs];

  // 2. On applique le premier filtre : Établissement spécifique (par ID)
  if (this.selectedEtablissement && this.selectedEtablissement !== "") {
    result = result.filter(d =>
      d.etablissements && d.etablissements.some((e: any) => e.id == this.selectedEtablissement)
    );
  }

  // 3. On applique le deuxième filtre : Statut de l'établissement (Actif/Inactif)
  if (this.statusFilter !== "") {
    const wantActive = (this.statusFilter === 'actif');

    result = result.filter(d => {
      if (d.etablissements && d.etablissements.length > 0) {
        const idDeLEtab = d.etablissements[0].id;
        // On cherche le statut dans la liste globale des établissements
        const etab = this.etablissements.find(e => e.idEtab === idDeLEtab);
        return etab ? etab.statut === wantActive : false;
      }
      return false;
    });
  }

  // 4. On met à jour la liste affichée dans le tableau
  this.directeurs = result;
  this.cdr.detectChanges();
}

// Les fonctions appelées par le HTML se contentent d'appeler applyFilters
filterByEtablissement() {
  this.applyFilters();
}

filterByStatus() {
  this.applyFilters();
}
initForm() {
  this.directeurForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    username: ['', [Validators.required, Validators.email]], // Doit être un email valide !
    dateNais: ['', Validators.required],
    password: [''], // On le laisse vide par défaut
    etablissementId: [null, Validators.required] // Ne doit pas être null
  });
}

openAddModal() {
  this.isEditMode = false;
  this.directeurForm.reset({
    etablissementId: null, // Force la valeur initiale à null
    nom: '',
    prenom: '',
    username: '',
    dateNais: ''
  });
  this.showModal = true;
}

openEditModal(d: any) {
  this.isEditMode = true;
  this.selectedDirecteur = d;
  // On enlève le validateur requis pour la modification
  this.directeurForm.get('password')?.clearValidators();
  this.directeurForm.get('password')?.updateValueAndValidity();

  this.directeurForm.patchValue({
    nom: d.nom,
    prenom: d.prenom,
    username: d.username,
    dateNais: d.dateNais,
    etablissementId: d.etablissements?.[0]?.id || null
  });
  this.showModal = true;
}

  closeModal() { this.showModal = false; }

  onSubmit() {
    if (this.directeurForm.invalid) return;
    const val = this.directeurForm.value;
    const obs = this.isEditMode
      ? this.service.updateDirecteur(this.selectedDirecteur.id, val)
      : this.service.createDirecteur(val);

    obs.subscribe(() => {
      this.loadData();
      this.closeModal();
      this.cdr.detectChanges();
    });
  }

  deleteDirecteur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce directeur ?')) {
      this.loading = true; // Affiche un indicateur de chargement

      this.service.deleteDirecteur(id).subscribe({
        next: () => {
          // Option 1 : Recharger toutes les données depuis le serveur
          this.loadData();

          // Option 2 (Plus rapide) : Filtrer la liste locale immédiatement
          // this.directeurs = this.directeurs.filter(d => d.id !== id);
          // this.allDirecteurs = this.allDirecteurs.filter(d => d.id !== id);

          console.log('Directeur supprimé avec succès');
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          alert('Impossible de supprimer le directeur. Vérifiez vos permissions.');
          this.loading = false;
        }

      });
    }
  }

  onCheckboxChange(id: number, e: any) {
    if (e.target.checked) {
      this.selectedDirecteurs.push(id);
    } else {
      this.selectedDirecteurs = this.selectedDirecteurs.filter(i => i !== id);
    }
  }

  selectAll(e: any) {
    this.selectedDirecteurs = e.target.checked
      ? this.directeurs.map(d => d.id)
      : [];
  }

  isAllSelected() {
    return this.selectedDirecteurs.length === this.directeurs.length;
  }

  deleteSelected() {
    this.service.deleteMultiple(this.selectedDirecteurs)
      .subscribe(() => {
        this.selectedDirecteurs = [];
        this.loadData();
        this.cdr.detectChanges();
      });
  }

  activateSelected() {
    this.service.activateMultiple(this.selectedDirecteurs)
      .subscribe(() => {
        this.allDirecteurs = this.allDirecteurs.map(dir =>
          this.selectedDirecteurs.includes(dir.id) ? { ...dir, statut: true } : dir
        );
        this.directeurs = [...this.allDirecteurs];
        this.selectedDirecteurs = [];
        this.cdr.detectChanges();
      });
  }

  deactivateSelected() {
    this.service.deactivateMultiple(this.selectedDirecteurs)
      .subscribe(() => {
        this.allDirecteurs = this.allDirecteurs.map(dir =>
          this.selectedDirecteurs.includes(dir.id) ? { ...dir, statut: false } : dir
        );
        this.directeurs = [...this.allDirecteurs];
        this.selectedDirecteurs = [];
        this.cdr.detectChanges();
      });
  }
  trackById(index: number, item: any) {
    return item.id;
  }




  viewDirecteur(d: any) {
    this.selectedDirecteur = d;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
  }

  toggleStatus(d: any) {
    this.service.toggleDirecteurStatus(d.id).subscribe({
      next: (updated) => {
        this.directeurs = this.directeurs.map(dir =>
          dir.id === d.id ? { ...dir, statut: updated.statut } : dir
        );

        // 🔹 IMPORTANT : mettre aussi à jour la liste complète utilisée pour le filtrage
        this.allDirecteurs = this.allDirecteurs.map(dir =>
          dir.id === d.id ? { ...dir, statut: updated.statut } : dir
        );

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }



// Confirmer suppression depuis le modal
  confirmDelete(): void {
    if (!this.directeurToDeleteId) return;

    this.service.deleteDirecteur(this.directeurToDeleteId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.loadData();
        this.selectedDirecteurs = this.selectedDirecteurs.filter(id => id !== this.directeurToDeleteId);
        this.directeurToDeleteId = null;
      },
      error: (err) => {
        console.error('Erreur suppression directeur', err);
        this.showDeleteModal = false;
        this.directeurToDeleteId = null;
      }
    });
  }

// Fermer modal delete
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.directeurToDeleteId = null;
  }
  openDeleteModal(id: number) {
    this.directeurToDeleteId = id;
    this.showDeleteModal = true;
  }

}






