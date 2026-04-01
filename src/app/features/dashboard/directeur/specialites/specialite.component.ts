import { Component, OnInit } from '@angular/core';
import { DirecteurService } from '../../../../core/services/directeur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-specialite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialite.component.html',
  styleUrls: ['./specialite.component.css']
})
export class SpecialiteComponent implements OnInit {

  specialites: any[] = [];
  selectedIds: number[] = [];
  originalNom: string = '';
  loading = true;


  showModal = false;
  isEdit = false;
  form: any = { nom: '' };
  currentId: number | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(private directeurService: DirecteurService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSpecialites();
  }


  loadSpecialites() {
    this.loading = true;

    this.directeurService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }


  onCheckboxChange(id: number, event: any) {
    if (event.target.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedIds = this.specialites.map(s => s.idSpecialite);
    } else {
      this.selectedIds = [];
    }
  }

  isAllSelected() {
    return this.specialites.length > 0 &&
      this.selectedIds.length === this.specialites.length;
  }

  trackById(index: number, item: any) {
    return item.idSpecialite;
  }


  openAdd() {
    this.originalNom = '';
    this.isEdit = false;
    this.form = { nom: '' };
    this.showModal = true;
  }

  openEdit(sp: any) {
    this.isEdit = true;
    this.form = { nom: sp.nom };
    this.originalNom = sp.nom;
    this.currentId = sp.idSpecialite;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (this.isSubmitDisabled()) return;

    if (this.isEdit) {
      this.directeurService.updateSpecialite(this.currentId!, this.form)
        .subscribe(() => {
          this.successMessage = "Spécialité modifiée";
          this.loadSpecialites();
          this.closeModal();
        });
    } else {
      this.directeurService.addSpecialite(this.form)
        .subscribe(() => {
          this.successMessage = "Spécialité ajoutée";
          this.loadSpecialites();
          this.closeModal();
        });
    }
  }


  toggle(sp: any) {
    this.directeurService.toggleSpecialite(sp.idSpecialite)
      .subscribe(() => this.loadSpecialites());
  }

  delete(id: number) {
    this.directeurService.deleteSpecialite(id)
      .subscribe(() => this.loadSpecialites());
  }


  activateSelected() {
    this.directeurService.activateMultipleSpecialites(this.selectedIds)
      .subscribe(() => {
        this.loadSpecialites();
        this.selectedIds = [];
      });
  }

  deactivateSelected() {
    this.directeurService.deactivateMultipleSpecialites(this.selectedIds)
      .subscribe(() => {
        this.loadSpecialites();
        this.selectedIds = [];
      });
  }


deleteSelected() {
  if (this.selectedIds.length === 0) return;

  const calls = this.selectedIds.map(id =>
    this.directeurService.deleteSpecialite(id)
  );

  forkJoin(calls).subscribe(() => {
    this.successMessage = "Suppression réussie";
    this.selectedIds = [];
    this.loadSpecialites();
  });
}

  isSubmitDisabled(): boolean {
    const nom = this.form.nom?.trim();


    if (!nom) return true;


    if (this.isEdit && nom === this.originalNom) return true;

    return false;
  }

}
