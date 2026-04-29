
import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule,ReactiveFormsModule,FormBuilder,FormGroup,Validators,FormArray} from '@angular/forms';
import { ElementRef, ViewChild } from '@angular/core';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import {AuthService} from '../../../../core/services/auth.service';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

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
  isSuperAdmin: boolean = false;
  isAdminTenant: boolean = false;


  allCatQuestions: any[] = [];
  selectedCategories: any[] = [];
  showCatModal = false;
  searchCat: string = '';
  tempSelectedCategories: any[] = [];
  allMotCles: any[] = [];
  filteredMotCles: any[][] = [];
  currentUser: any;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private service: SuperAdminService,private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private moduleTenantService: ModuleTenantService,
    private cdr: ChangeDetectorRef)
  {

    this.moduleForm = this.fb.group({
      nom: ['', Validators.required],
      disponibilite: [true],
      categorieModule: [null, Validators.required],
      nombreMotCle: [0],
      motCles: this.fb.array([])
    });
  }

goToQuestions(moduleId: number) {
  this.router.navigate(['/super-admin/questions', moduleId]);
}
goToBehavioralQuestions() {
  this.router.navigate(['/super-admin/questions/0']);
}
  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.isSuperAdmin = this.currentUser?.role === 'superAdmin';
    this.isAdminTenant =this.currentUser?.role === 'adminTenant';
    this.loadData();

  }

  get motCles(): FormArray {
    return this.moduleForm.get('motCles') as FormArray;
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
      mods: this.service.getModules(),
      motCles: this.service.getMotCles()
    }).subscribe({
      next: (result) => {
        this.categories = result.cats;
        this.allModules = result.mods;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
        this.allMotCles = result.motCles;
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
    this.selectedCategories = [];


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

    this.selectedCategories = m.categories ? [...m.categories] : [];

    this.showModal = true;
  }

  onSubmit() {
    if (this.moduleForm.valid) {
      const formVal = this.moduleForm.value;

      const dataToSend = {
        nom: formVal.nom,
        disponibilite: formVal.disponibilite ?? true,
        categorieModule: {
          id: formVal.categorieModule.id
        },
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
        }
      });
    }
  }
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
  if (!file) return;

  if (!file.name.endsWith('.xlsx')) {
    alert("Veuillez sélectionner un fichier Excel (.xlsx)");
    return;
  }

  this.loading = true;
  this.service.importModuleExcel(file).subscribe({
    next: (res) => {
      let msg = `📊 Importation des modules terminée !\n`;
      msg += `✅ Réussites/Mises à jour : ${res.successCount}\n`;

      if (res.ignoredLines && res.ignoredLines.length > 0) {
        msg += `⚠️ Lignes en erreur : ${res.ignoredLines.join(', ')}`;
      }

      alert(msg);
      this.loadData();
      this.loading = false;

      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    },
    error: (err) => {
      alert("Erreur lors de l'envoi du fichier Excel.");
      this.loading = false;
    }
  });
}

  /*onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.loading = true;
      this.service.importModuleCSV(file).subscribe({
        next: (res) => {
          let msg = `Importation terminée !\n`;
          msg += `- Réussites/Mises à jour : ${res.successCount}\n`;


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
    this.cdr.detectChanges();
  }
  cancelCategories() {
    this.showCatModal = false;
  }


  addMotCleField(id: number | null = null, desc: string = '') {
    this.motCles.push(this.fb.group({
      idMotcle: [id],
      description: [desc, Validators.required]
    }));
  }

  removeMotCle(index: number) {
    this.motCles.removeAt(index);
    this.moduleForm.patchValue({
      nombreMotCle: this.motCles.length
    }, { emitEvent: false });
  }

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
    this.filteredMotCles[index] = [];
  }

  protected readonly HTMLInputElement = HTMLInputElement;

  addToModuleTenant(): void {
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur;

    if (!userId) {
      alert("Erreur : Impossible de récupérer votre ID utilisateur. Veuillez vous reconnecter.");
      return;
    }

    if (this.selectedModules.length === 0) {
      alert("Veuillez sélectionner au moins un module.");
      return;
    }

    this.loading = true;

    const requests = this.selectedModules.map(moduleId =>
      this.moduleTenantService.addModuleToTenant(userId, moduleId)
    );

    import('rxjs').then(({ forkJoin }) => {
      forkJoin(requests).subscribe({
        next: (responses) => {
          console.log(`${responses.length} modules ajoutés avec succès.`);
          alert("✅ Les modules ont été ajoutés à votre catalogue avec succès !");

          this.selectedModules = [];
          this.loading = false;

          this.cdr.detectChanges();

        },
        error: (err) => {
          console.error("Erreur lors de l'ajout des modules :", err);
          this.loading = false;
          this.cdr.detectChanges();
          alert("❌ Une erreur est survenue. Vérifiez que vous êtes bien lié à un établissement.");
        }
      });
    });
  }

downloadTemplate() {
    const header = [['Module' , 'catégorie','mots clés']];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(header);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Modules');
    XLSX.writeFile(wb, 'Modele_Import_Modules.xlsx');
  }
}
