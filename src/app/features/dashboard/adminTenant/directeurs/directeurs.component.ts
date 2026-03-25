/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 🔥 IMPORTANT
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // 🔥 IMPORTANT
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';

@Component({
  selector: 'app-directeurs',
  standalone: true, // 🔥 IMPORTANT
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './directeurs.component.html',
  styleUrls: ['./directeurs.component.css']
})
export class DirecteursComponent implements OnInit {

  directeurs: any[] = [];
  etablissements: any[] = [];
  selectedDirecteurs: number[] = [];
  allDirecteurs: any[] = [];


  showModal = false;
  showViewModal = false;
  showDeleteModal = false;

  isEditMode = false;
  selectedDirecteur: any;

  directeurForm!: FormGroup;

  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedEtablissement: number | '' = '';

  constructor(private service: AdminTenantService,
              private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.directeurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      dateNais: ['', Validators.required],
      password: [''],
      etablissementId: ['', Validators.required]
    });
  }

  loadData() {
    this.loading = true;

    this.service.getDirecteurs().subscribe(res => {
      this.directeurs = res;
      this.allDirecteurs = res;
      this.loading = false;
    });

    this.service.getEtablissements().subscribe(res => {
      console.log(res);

      this.etablissements = [...res]; // 🔥 TRÈS IMPORTANT
    });
  }

  // ✅ FILTRE PAR ETABLISSEMENT


  filterByEtablissement() {

    if (!this.selectedEtablissement) {
      this.directeurs = this.allDirecteurs;
      return;
    }

    const selected = this.etablissements.find(
      e => e.idEtab == this.selectedEtablissement
    );

    this.directeurs = this.allDirecteurs.filter(
      d => d.nomEtablissement == selected?.nom
    );
  }




  openAddModal() {
    this.isEditMode = false;

    this.directeurForm.reset({
      etablissementId: null
    });

    this.showModal = true;
  }

  openEditModal(d: any) {
    this.isEditMode = true;
    this.selectedDirecteur = d;

    this.directeurForm.patchValue({
      ...d
    });

    this.showModal = true;
  }

  viewDirecteur(d: any) {
    this.selectedDirecteur = d;
    this.showViewModal = true;
  }

  closeModal() { this.showModal = false; }
  closeViewModal() { this.showViewModal = false; }

  // ================= CRUD =================
  onSubmit() {
    console.log("FORM:", this.directeurForm.value);
    if (this.directeurForm.invalid) return;

    const req = this.isEditMode
      ? this.service.updateDirecteur(this.selectedDirecteur.id, this.directeurForm.value)
      : this.service.createDirecteur(this.directeurForm.value);

    req.subscribe(() => {
      this.loadData();
      this.closeModal();
    });
  }

  deleteDirecteur(id: number) {
    this.service.deleteDirecteur(id).subscribe(() => this.loadData());
  }

  toggleStatus(d: any) {
    this.service.toggleDirecteurStatus(d.id).subscribe(() => this.loadData());
  }

  // ================= BULK =================
  deleteSelected() {
    this.service.deleteMultiple(this.selectedDirecteurs)
      .subscribe(() => this.loadData());
  }

  activateSelected() {
    this.service.activateMultiple(this.selectedDirecteurs)
      .subscribe(() => this.loadData());
  }

  deactivateSelected() {
    this.service.deactivateMultiple(this.selectedDirecteurs)
      .subscribe(() => this.loadData());
  }

  // ================= CHECKBOX =================
  onCheckboxChange(id: number, e: any) {
    e.target.checked
      ? this.selectedDirecteurs.push(id)
      : this.selectedDirecteurs = this.selectedDirecteurs.filter(i => i !== id);
  }

  selectAll(e: any) {
    this.selectedDirecteurs = e.target.checked
      ? this.directeurs.map(d => d.id)
      : [];
  }

  isAllSelected() {
    return this.selectedDirecteurs.length === this.directeurs.length;
  }

  trackById(index: number, item: any) {
    return item.id;
  }



}*/


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



  selectedEtablissement: any = ""; // Pour le [(ngModel)] du filtre
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedDirecteur: any;
  directeurForm!: FormGroup;

  constructor(
    private service: AdminTenantService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.directeurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      dateNais: ['', Validators.required],
      password: [''],
      etablissementId: [null, Validators.required]
    });
  }

  loadData() {
    this.service.getEtablissements().subscribe(etabs => {
      this.etablissements = etabs;

      this.service.getDirecteurs().subscribe(res => {
        console.log("Données directeurs reçues :", res); // Vérifie ici si 'etablissements' est présent dans chaque objet
        this.allDirecteurs = res;
        this.directeurs = res;
        this.cdr.detectChanges();
      });
    });
  }

  filterByEtablissement() {
    const selectedId = this.selectedEtablissement;
    console.log("Filtrage pour l'ID d'établissement :", selectedId);

    // Cas 1 : "Tous les établissements"
    if (!selectedId || selectedId === "" || selectedId === "null") {
      this.directeurs = [...this.allDirecteurs];
    }
    else {
      // Cas 2 : On filtre les directeurs
      this.directeurs = this.allDirecteurs.filter(d => {
        // On vérifie si le directeur possède l'ID dans sa liste d'établissements
        // (On utilise == pour comparer String et Number sans souci)
        return d.etablissements && d.etablissements.some((e: any) => e.id == selectedId);
      });
    }

    console.log("Résultat du filtre :", this.directeurs.length, "directeurs trouvés");
    this.cdr.detectChanges();
  }

  // --- MODAL HELPERS ---
  openAddModal() {
    this.isEditMode = false;
    this.directeurForm.reset({ etablissementId: null });
    this.showModal = true;
  }

  openEditModal(d: any) {
    this.isEditMode = true;
    this.selectedDirecteur = d;
    // On récupère l'ID de l'établissement pour le select
    const etabId = d.etablissements && d.etablissements.length > 0 ? d.etablissements[0].id : null;

    this.directeurForm.patchValue({
      nom: d.nom,
      prenom: d.prenom,
      username: d.username,
      dateNais: d.dateNais,
      etablissementId: etabId
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
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          alert('Impossible de supprimer le directeur. Vérifiez vos permissions.');
          this.loading = false;
        }
      });
    }
  }
}
