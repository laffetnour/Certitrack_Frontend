
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
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private service: SuperAdminService,private fb: FormBuilder,private cdr: ChangeDetectorRef)
  {

    this.moduleForm = this.fb.group({
      nom: ['', Validators.required],
      seuilScore: [null],
      dureeQCM: [null],
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

  addMotCleField(id: number | null = null, desc: string = '') {
    this.motCles.push(this.fb.group({
      idMotcle: [id],
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

  openEditModal(m: any) {
    this.isEditMode = true;
    this.selectedModule = m;
    this.moduleForm.patchValue({
      nom: m.nom,
      disponibilite: m.disponibilite,
      seuilScore: m.seuilScore,
      dureeQCM: m.dureeQCM,
      categorieModule: this.categories.find(c => c.id == m.idCategorie),
      nombreMotCle: m.motCles ? m.motCles.length : 0
    });

    this.motCles.clear();
    if (m.motCles) {
      m.motCles.forEach((mc: any) => {
        this.addMotCleField(mc.idMotcle, mc.description);
      });
    }
    this.showModal = true;
  }

  onSubmit() {
    if (this.moduleForm.valid) {

      const formVal = this.moduleForm.value;

      const dataToSend: any = {
        nom: formVal.nom,
        disponibilite: formVal.disponibilite,
        seuilScore: formVal.seuilScore,
        dureeQCM: formVal.dureeQCM,
        categorieModule: formVal.categorieModule,
        motCles: formVal.motCles.map((mc: any) => ({
          idMotcle: mc.idMotcle,
          description: mc.description
        }))
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

}
