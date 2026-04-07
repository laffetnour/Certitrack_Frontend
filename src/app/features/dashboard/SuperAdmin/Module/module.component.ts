
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule,ReactiveFormsModule,FormBuilder,FormGroup,Validators,FormArray} from '@angular/forms';
import { ElementRef, ViewChild } from '@angular/core';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './module.component.html',
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


  allCatQuestions: any[] = [];
  selectedCategories: any[] = [];
  showCatModal = false;
  searchCat: string = '';
  tempSelectedCategories: any[] = [];
  allMotCles: any[] = [];
  //filteredMotCles: any[] = [];
  filteredMotCles: any[][] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private service: SuperAdminService,private fb: FormBuilder,private cdr: ChangeDetectorRef)
  {

    this.moduleForm = this.fb.group({
      nom: ['', Validators.required],
      disponibilite: [true],
      categorieModule: [null, Validators.required],
      nombreMotCle: [0],
      motCles: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get motCles(): FormArray {
    return this.moduleForm.get('motCles') as FormArray;
  }

  /*addMotCleField(id: number | null = null, desc: string = '') {
    this.motCles.push(this.fb.group({
      idMotcle: [id],
      //description: [desc, Validators.required]
      description: [desc]//666666666666666666666666666666666666666666666666666666666666666666666666
    }));
  }*/

  /*removeMotCle(index: number) {
    this.motCles.removeAt(index);
  }*/

  onNombreChange() {
    const n = this.moduleForm.value.nombreMotCle;
    const currentLength = this.motCles.length;

    if (n > currentLength) {
      for (let i = currentLength; i < n; i++) {
        this.addMotCleField();
      }
    } else if (n < currentLength) {
      for (let i = currentLength; i > n; i--) {
        this.removeMotCle(i - 1);
      }
    }
  }

  loadData() {
    this.loading = true;

    forkJoin({
      cats: this.service.getCategories(),
      mods: this.service.getModules(),
      catQ: this.service.getCatQuestions(), // 🔥 ajouter 666666666666666666666666666666666666666666666666666666666666666666666666
      motCles: this.service.getMotCles()//6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    }).subscribe({
      next: (result) => {
        this.categories = result.cats;
        this.allModules = result.mods;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
        this.allCatQuestions = result.catQ; // 🔥ajouter 6666666666666666666666666666666666666666666666666666666666666666666666666
        this.allMotCles = result.motCles;//666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
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

  openAddModal() {
    this.isEditMode = false;
    this.selectedModule = null;
    this.moduleForm.reset({
      nom: '',
      disponibilite: true,
      categorieModule: null,
      nombreMotCle: 0
    });

    this.motCles.clear();
    this.selectedCategories = []; // 🔥 IMPORTANT66666666666666666666666666666666666666666666666666666666666666666666666666666666


    this.showModal = true;
  }

  openEditModal(m: any) {
    this.isEditMode = true;
    this.selectedModule = m;
    this.moduleForm.patchValue({
      nom: m.nom,
      disponibilite: m.disponibilite,
      categorieModule: this.categories.find(c => c.id == m.idCategorie),
      nombreMotCle: m.motCles ? m.motCles.length : 0
    });

    this.motCles.clear();
    if (m.motCles) {
      m.motCles.forEach((mc: any) => {
        this.addMotCleField(mc.idMotcle, mc.description);
      });
    }

    this.selectedCategories = m.categories ? [...m.categories] : [];//666666666666666666666666666666666666666666666666666666666666666666666

    this.showModal = true;
  }

 /* onSubmit() {
    if (this.moduleForm.valid) {

      const formVal = this.moduleForm.value;

      const dataToSend: any = {
        nom: formVal.nom,
        disponibilite: formVal.disponibilite,
        categorieModule: formVal.categorieModule,
        motCles: formVal.motCles.map((mc: any) => ({
          idMotcle: mc.idMotcle,
          description: mc.description
        })),
        //categories: this.selectedCategories // 🔥 AJOUT ICI6666666666666666666666666666666666666666666666666666666666666666666666666666666
        categories: [...this.selectedCategories]
      };

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
  }*/

  //6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
  onSubmit() {
    if (this.moduleForm.valid) {
      const formVal = this.moduleForm.value;

      const dataToSend = {
        nom: formVal.nom,
        disponibilite: formVal.disponibilite ?? true,
        // Correction ici : le champ dans categorieModule est 'id'
        categorieModule: {
          id: formVal.categorieModule.id
        },
        // On envoie les mots-clés avec idMotcle s'ils existent
        motCles: formVal.motCles.map((mc: any) => ({
          idMotcle: mc.idMotcle || null,
          description: mc.description
        })),
        categories: this.selectedCategories.map(cat => ({ id: cat.id }))
      };

      console.log("Payload final :", dataToSend);

      const request = this.isEditMode
        ? this.service.updateModule(this.selectedModule.idModule, dataToSend)
        : this.service.addModule(dataToSend);

      request.subscribe({
        next: (res) => {
          this.showModal = false;
          this.loadData();
        },
        error: (err) => {
          console.error("Erreur API complète :", err);
          // Si erreur 400, vérifiez l'onglet Network > Response pour le détail
        }
      });
    }
  }
//66666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
// Méthode utilitaire pour afficher les erreurs visuellement
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }



  deleteModule(id: number) {
    if (id && confirm("Êtes-vous sûr ?")) {
      this.service.deleteModule(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }

  toggleStatus(m: any)
  {
    const id = m.idModule;
    if (!id) {
      console.error("ID du module introuvable dans l'objet :", m);
      return;
    }
    this.service.toggleModuleStatus(id).subscribe({
      next: () => {
        console.log("Statut mis à jour pour l'ID:", id);
        this.loadData();
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

  onImportClick() {
    this.fileInput.nativeElement.click();
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.service.importModuleCSV(file).subscribe({
        next: (res) => {
          let msg = `Importation terminée !\n`;
          msg += `- Réussites/Mises à jour : ${res.successCount}\n`;
          msg += `- Lignes ignorées (categories Questions n'existent pas) : ${res.errorCount}\n`;

          if (res.ignoredLines && res.ignoredLines.length > 0) {
            msg += `- Numéros des lignes en erreur : ${res.ignoredLines.join(', ')}`;
          }

          alert(msg);
          this.loadData();
          event.target.value = '';
        },
        error: (err) => {
          alert("Erreur lors de l'envoi du fichier.");
          this.loading = false;
        }
      });
    }
  }

  //6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
  /*toggleCategory(cat: any) {
    const index = this.selectedCategories.findIndex(c => c.id === cat.id);

    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(cat);
    }
  }*/

  /*isSelectedCategory(cat: any): boolean {
    return this.selectedCategories.some(c => c.id === cat.id);
  }*/

  openCatModal() {
    this.tempSelectedCategories = [...this.selectedCategories];
    this.showCatModal = true;
  }
  toggleCategory(cat: any) {
    const index = this.tempSelectedCategories.findIndex(c => c.id === cat.id);

    if (index > -1) {
      this.tempSelectedCategories.splice(index, 1);
    } else {
      this.tempSelectedCategories.push(cat);
    }
  }

  isSelectedCategory(cat: any): boolean {
    return this.tempSelectedCategories.some(c => c.id === cat.id);
  }

  confirmCategories() {
    this.selectedCategories = [...this.tempSelectedCategories];
    this.showCatModal = false;
    this.cdr.detectChanges(); // 🔥 IMPORTANT
  }
  cancelCategories() {
    this.showCatModal = false;
  }

  get filteredCatQuestions() {
    if (!this.searchCat) return this.allCatQuestions;

    return this.allCatQuestions.filter(c =>
      c.nom.toLowerCase().includes(this.searchCat.toLowerCase())
    );
  }

  // 1. Ajoutez les méthodes de gestion des champs de mots-clés
  addMotCleField(id: number | null = null, desc: string = '') {
    this.motCles.push(this.fb.group({
      idMotcle: [id],
      description: [desc, Validators.required] // Le validateur ici bloque le bouton si vide
    }));
  }

  removeMotCle(index: number) {
    this.motCles.removeAt(index);
    // On met à jour manuellement le compteur pour rester cohérent avec l'UI
    this.moduleForm.patchValue({
      nombreMotCle: this.motCles.length
    }, { emitEvent: false });
  }

// 2. Ajoutez les méthodes de suggestion (utilisées dans votre HTML)
  suggestMotCles(query: string, index: number) {
    if (!query || query.trim() === '') {
      this.filteredMotCles[index] = [];
      return;
    }
    this.filteredMotCles[index] = this.allMotCles.filter(mc =>
      mc.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  selectMotCle(mc: any, index: number) {
    const control = this.motCles.at(index);
    control.patchValue({
      idMotcle: mc.idMotcle,
      description: mc.description
    });
    this.filteredMotCles[index] = []; // On vide la liste après sélection
  }

  protected readonly HTMLInputElement = HTMLInputElement;
}
