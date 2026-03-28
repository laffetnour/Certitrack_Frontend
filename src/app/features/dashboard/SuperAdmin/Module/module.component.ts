/*import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './module.component.html',
  styleUrls: ['.././superAdmin.component.css']
})
export class ModuleComponent implements OnInit {
  allModules: any[] = [];
  filteredModules: any[] = [];
  categories: any[] = [];

  selectedFilterCat: string = '';
  showModal = false;
  isEditMode = false;
  selectedModule: any = null;
  moduleForm: FormGroup;
  loading = false;

  constructor(private service: SuperAdminService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
  this.moduleForm = this.fb.group({
    nom: ['', [Validators.required]],
    seuilScore: [null], // Initialisé à null, sans validateur requis
    dureeQCM: [null],   // Initialisé à null, sans validateur requis
    disponibilite: [true],
    categorieModule: [null, Validators.required]
  });
  }

  ngOnInit(): void {
    this.loadData();
  }



loadData() {
  this.loading = true;
  forkJoin({
    cats: this.service.getCategories(),
    mods: this.service.getModules()
  }).subscribe({
    next: (result) => {
      this.categories = result.cats;
      // On s'assure que chaque module a bien sa catégorie liée
      this.allModules = result.mods.map(m => {
        console.log("Vérification module :", m.nom, "Catégorie :", m.categorieModule);
        return m;
      });
      this.applyFilter();
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Erreur chargement :", err);
      this.loading = false;
    }
  });
}

 applyFilter() {
   if (!this.selectedFilterCat) {
     this.filteredModules = [...this.allModules];
   } else {
     // On utilise idCategorie (que tu as dû ajouter avec @JsonProperty dans l'entité Module)
     // ou on compare avec l'ID trouvé via le nom si nécessaire
     this.filteredModules = this.allModules.filter(m => m.idCategorie == this.selectedFilterCat);
   }
 }

 openAddModal() {
   this.isEditMode = false;
   this.selectedModule = null;

   // On reset TOUS les champs, y compris score et durée à null
   this.moduleForm.reset({
     nom: '',
     disponibilite: true,
     categorieModule: null,
     seuilScore: null, // Permet de repartir sur un champ vide (null)
     dureeQCM: null    // Permet de repartir sur un champ vide (null)
   });
   this.showModal = true;
 }

openEditModal(m: any) {
  this.isEditMode = true;
  this.selectedModule = m;

  this.moduleForm.patchValue({
    nom: m.nom,
    disponibilite: m.disponibilite,
    seuilScore: m.seuilScore,
    dureeQCM: m.dureeQCM,
    // On cherche la catégorie par l'ID que le backend a envoyé via @JsonProperty("idCategorie")
    categorieModule: this.categories.find(c => c.id == m.idCategorie)
  });
  this.showModal = true;
}

 onSubmit() {
   if (this.moduleForm.valid) {
     const formVal = this.moduleForm.value;

     // 1. Préparation de l'objet propre
     const dataToSend: any = {
       nom: formVal.nom,
       disponibilite: formVal.disponibilite,
       // On s'assure que si c'est vide/undefined, on envoie un vrai null JSON
       seuilScore: (formVal.seuilScore === '' || formVal.seuilScore === null || formVal.seuilScore === undefined) ? null : formVal.seuilScore,
       dureeQCM: (formVal.dureeQCM === '' || formVal.dureeQCM === null || formVal.dureeQCM === undefined) ? null : formVal.dureeQCM,
       categorieModule: formVal.categorieModule
     };

     // 2. CRUCIAL : Ajouter l'ID dans l'objet pour le PUT
     if (this.isEditMode && this.selectedModule) {
       dataToSend.idModule = this.selectedModule.idModule;
     }

     console.log("Payload envoyé :", dataToSend);

     const request = this.isEditMode
       ? this.service.updateModule(this.selectedModule.idModule, dataToSend)
       : this.service.addModule(dataToSend);

     request.subscribe({
       next: () => {
         this.showModal = false;
         this.loadData(); // Rafraîchit la liste
       },
       error: (err) => {
         console.error("Erreur Backend détaillée :", err);
         // Rappel : Si 403 ici, vérifie le .csrf().disable() dans SecurityConfig.java
       }
     });
   }
 }

 deleteModule(id: number) {
   if (id && confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
     this.service.deleteModule(id).subscribe({
       next: () => this.loadData(),
       error: (err) => console.error("Erreur lors de la suppression :", err)
     });
   }
 }
}*/


import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './module.component.html',
  //styleUrls: ['.././superAdmin.component.css']
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit {

  allModules: any[] = [];
  filteredModules: any[] = [];
  categories: any[] = [];
  selectedModules: number[] = [];
  selectedFilterCat: string = '';
  showModal = false;
  isEditMode = false;
  selectedModule: any = null;
  moduleForm: FormGroup;
  loading = false;
  showDeleteModal = false;
  idToDelete: number | null = null;
  showViewModal = false;
  moduleToView: any = null;
  constructor(
    private service: SuperAdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {

    // ✅ FORMULAIRE COMPLET
    this.moduleForm = this.fb.group({
      nom: ['', Validators.required],
      seuilScore: [null],
      dureeQCM: [null],
      disponibilite: [true],
      categorieModule: [null, Validators.required],

      // 🔥 MOTS-CLÉS
      nombreMotCle: [0],
      motCles: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  // =========================
  // 🔥 FORM ARRAY MOTS-CLÉS
  // =========================

  get motCles(): FormArray {
    return this.moduleForm.get('motCles') as FormArray;
  }

  addMotCleField(id: number | null = null, desc: string = '') {
    this.motCles.push(this.fb.group({
      idMotcle: [id], // On garde l'ID caché
      description: [desc, Validators.required]
    }));
  }

  removeMotCle(index: number) {
    this.motCles.removeAt(index);
  }

  onNombreChange() {
    const n = this.moduleForm.value.nombreMotCle;
    const currentLength = this.motCles.length;

    if (n > currentLength) {
      // On ajoute seulement la différence
      for (let i = currentLength; i < n; i++) {
        this.addMotCleField();
      }
    } else if (n < currentLength) {
      // On retire si l'utilisateur diminue le nombre
      for (let i = currentLength; i > n; i--) {
        this.removeMotCle(i - 1);
      }
    }
  }

  // =========================
  // 🔄 DATA
  // =========================

  loadData() {
    this.loading = true;

    forkJoin({
      cats: this.service.getCategories(),
      mods: this.service.getModules()
    }).subscribe({
      next: (result) => {
        this.categories = result.cats;
        this.allModules = result.mods;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur chargement :", err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    if (!this.selectedFilterCat) {
      this.filteredModules = [...this.allModules];
    } else {
      this.filteredModules = this.allModules.filter(
        m => m.idCategorie == this.selectedFilterCat
      );
    }
  }

  // =========================
  // ➕ AJOUT
  // =========================

  openAddModal() {
    this.isEditMode = false;
    this.selectedModule = null;

    this.moduleForm.reset({
      nom: '',
      disponibilite: true,
      categorieModule: null,
      seuilScore: null,
      dureeQCM: null,
      nombreMotCle: 0
    });

    this.motCles.clear();

    this.showModal = true;
  }

  // =========================
  // ✏️ MODIFICATION
  // =========================

  openEditModal(m: any) {
    this.isEditMode = true;
    this.selectedModule = m;

    this.moduleForm.patchValue({
      nom: m.nom,
      disponibilite: m.disponibilite,
      seuilScore: m.seuilScore,
      dureeQCM: m.dureeQCM,
      categorieModule: this.categories.find(c => c.id == m.idCategorie),
      nombreMotCle: m.motCles ? m.motCles.length : 0 // ✅ Set le nombre initial
    });

    this.motCles.clear();
    if (m.motCles) {
      m.motCles.forEach((mc: any) => {
        this.addMotCleField(mc.idMotcle, mc.description); // On passe l'ID ici !
      });
    }
    this.showModal = true;
  }

  // =========================
  // 💾 SAVE
  // =========================

  onSubmit() {
    if (this.moduleForm.valid) {

      const formVal = this.moduleForm.value;

      const dataToSend: any = {
        nom: formVal.nom,
        disponibilite: formVal.disponibilite,
        seuilScore: formVal.seuilScore,
        dureeQCM: formVal.dureeQCM,
        categorieModule: formVal.categorieModule,

        // 🔥 MOTS-CLÉS FORMAT BACKEND
        motCles: formVal.motCles.map((mc: any) => ({
          idMotcle: mc.idMotcle, // Si null, c'est un nouveau. Si présent, Hibernate le reconnaît.
          description: mc.description
        }))
      };

      // mode edit
      if (this.isEditMode && this.selectedModule) {
        dataToSend.idModule = this.selectedModule.idModule;
      }

      const request = this.isEditMode
        ? this.service.updateModule(this.selectedModule.idModule, dataToSend)
        : this.service.addModule(dataToSend);

      request.subscribe({
        next: () => {
          this.showModal = false;
          this.loadData();
        },
        error: (err) => {
          console.error("Erreur Backend :", err);
        }
      });
    }
  }

  // =========================
  // 🗑️ DELETE
  // =========================

  deleteModule(id: number) {
    if (id && confirm("Êtes-vous sûr ?")) {
      this.service.deleteModule(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }





  toggleStatus(m: any) {
    // Changement ici : on utilise idModule car c'est le nom de la clé dans votre objet JSON
    const id = m.idModule;

    if (!id) {
      console.error("ID du module introuvable dans l'objet :", m);
      return;
    }

    this.service.toggleModuleStatus(id).subscribe({
      next: () => {
        console.log("Statut mis à jour pour l'ID:", id);
        this.loadData(); // Rafraîchissement de la liste pour voir le changement de badge
      },
      error: (err) => {
        console.error("Erreur Backend lors du toggle :", err);
      }
    });
  }


  openDeleteModal(id: number) {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.idToDelete) {
      this.service.deleteModule(this.idToDelete).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.loadData();
        },
        error: (err) => console.error(err)
      });
    }
  }
// Méthode pour voir les détails
  viewModule(m: any) {
    this.moduleToView = m;
    this.showViewModal = true;
  }
  onCheckboxChange(id: number, event: any) {
    if (event.target.checked) {
      this.selectedModules.push(id);
    } else {
      this.selectedModules = this.selectedModules.filter(m => m !== id);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedModules = this.filteredModules.map(m => m.idModule);
    } else {
      this.selectedModules = [];
    }
  }

  isAllSelected(): boolean {
    return this.filteredModules.length > 0 &&
      this.selectedModules.length === this.filteredModules.length;
  }

  activateSelected() {
    this.service.activateModules(this.selectedModules).subscribe({
      next: () => {
        this.selectedModules = [];
        this.loadData();
      },
      error: err => console.error(err)
    });
  }

  deactivateSelected() {
    this.service.deactivateModules(this.selectedModules).subscribe({
      next: () => {
        this.selectedModules = [];
        this.loadData();
      },
      error: err => console.error(err)
    });
  }



deleteSelected() {
  if (confirm("Supprimer les modules sélectionnés ?")) {

    const requests = this.selectedModules.map(id =>
      this.service.deleteModule(id)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.selectedModules = [];
        this.loadData();
      },
      error: err => console.error(err)
    });
  }
}




}
