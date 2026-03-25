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

  /*initForm() {
    this.directeurForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      dateNais: ['', Validators.required],
      password: [''],
      etablissementId: [null, Validators.required]
    });
  }*/


loadData() {
  this.loading = true;
  this.service.getEtablissements().subscribe({
    next: (etabs) => {
      this.etablissements = etabs;

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
}
  /*loadData() {
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
  console.log("Filtrage en cours pour l'ID établissement :", selectedId);

  if (!selectedId || selectedId === "" || selectedId === "null") {
    // Si rien n'est sélectionné, on réaffiche tout
    this.directeurs = [...this.allDirecteurs];
  } else {
    // FILTRAGE ROBUSTE :
    this.directeurs = this.allDirecteurs.filter(dir => {
      // 1. Vérifie si le directeur a une liste d'établissements
      if (dir.etablissements && Array.isArray(dir.etablissements)) {
        // 2. Vérifie si l'ID sélectionné est présent dans sa liste
        // On utilise '==' pour comparer string et number sans erreur
        return dir.etablissements.some((e: any) => e.id == selectedId);
      }
      return false;
    });
  }

  console.log("Nombre de directeurs après filtre :", this.directeurs.length);
  this.cdr.detectChanges();
}*/

  // --- MODAL HELPERS ---
  /*openAddModal() {
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
  }*/

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
