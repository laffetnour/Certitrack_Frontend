
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';
import { ConfigService } from '../../../../core/services/config.service';

@Component({
  selector: 'app-directeurs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './directeurs.component.html',
  styleUrls: ['./directeurs.component.css']
})
export class DirecteursComponent implements OnInit {
  directeurs: any[] = [];
  allDirecteurs: any[] = [];
  etablissements: any[] = [];

  selectedDirecteurs: number[] = [];
  activeEtablissements: any[] = [];

  showDeleteModal = false;
  directeurToDeleteId: number | null = null;

  selectedEtablissement: any = "";
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedDirecteur: any;
  showViewModal = false;
  directeurForm!: FormGroup;
  statusFilter: string = "";

  constructor(
    private service: AdminTenantService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public configService: ConfigService
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


    this.activeEtablissements = etabs.filter((e: any) => e.statut === true);

      this.service.getDirecteurs().subscribe({
        next: (res) => {
          console.log("Données reçues :", res);
          this.allDirecteurs = res || [];
          this.directeurs = [...this.allDirecteurs];
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


isEtablissementActive(d: any): boolean {

  if (!d.etablissements || d.etablissements.length === 0) return false;

  const idDeLEtab = d.etablissements[0].id;

  const etabComplet = this.etablissements.find(e => e.idEtab === idDeLEtab);

  return etabComplet ? etabComplet.statut === true : false;
}
isBulkActionAllowed(): boolean {
  if (this.selectedDirecteurs.length === 0) return false;

  return this.selectedDirecteurs.every(id => {

    const d = this.allDirecteurs.find(dir => dir.id === id);
    if (!d || !d.etablissements || d.etablissements.length === 0) return false;


    const idEtab = d.etablissements[0].id;
    const etab = this.etablissements.find(e => e.idEtab === idEtab);


    return etab ? etab.statut === true : false;
  });
}


applyFilters() {

  let result = [...this.allDirecteurs];


  if (this.selectedEtablissement && this.selectedEtablissement !== "") {
    result = result.filter(d =>
      d.etablissements && d.etablissements.some((e: any) => e.id == this.selectedEtablissement)
    );
  }


  if (this.statusFilter !== "") {
    const wantActive = (this.statusFilter === 'actif');

    result = result.filter(d => {
      if (d.etablissements && d.etablissements.length > 0) {
        const idDeLEtab = d.etablissements[0].id;

        const etab = this.etablissements.find(e => e.idEtab === idDeLEtab);
        return etab ? etab.statut === wantActive : false;
      }
      return false;
    });
  }


  this.directeurs = result;
  this.cdr.detectChanges();
}


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
    username: ['', [Validators.required, Validators.email]],
    dateNais: ['', Validators.required],
    password: [''],
    etablissementId: [null, Validators.required]
  });
}

openAddModal() {
  this.isEditMode = false;
  this.directeurForm.reset({
    etablissementId: null,
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
      this.loading = true;

      this.service.deleteDirecteur(id).subscribe({
        next: () => {

          this.loadData();


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


        this.allDirecteurs = this.allDirecteurs.map(dir =>
          dir.id === d.id ? { ...dir, statut: updated.statut } : dir
        );

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }


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


  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.directeurToDeleteId = null;
  }
  openDeleteModal(id: number) {
    this.directeurToDeleteId = id;
    this.showDeleteModal = true;
  }

}






