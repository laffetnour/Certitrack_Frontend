import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

 /* loadData() {
    this.loading = true;
    // On charge les deux en parallèle
    this.service.getCategories().subscribe(cats => this.categories = cats);
    this.service.getModules().subscribe(mods => {
      this.allModules = mods;
      this.applyFilter();
      this.loading = false;
      this.cdr.detectChanges();

    });
  }*/

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
}
