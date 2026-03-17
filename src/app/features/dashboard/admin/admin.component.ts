import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],  // Important!
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  candidats: any[] = [];
  selectedCandidats: number[] = [];
  showModal = false;
  showViewModal = false;
  isEditMode = false;
  selectedCandidat: any = null;

  candidatForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  specialites: any[] = [];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.candidatForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateNais: ['', Validators.required],// Ajout du champ date
      //nomEtablissement: ['']

      specialiteId: ['', Validators.required]  // ← nouveau champ
    });
  }

  ngOnInit(): void {
    console.log("AdminComponent chargé");
    //this.loadCandidats();
    this.loadCandidatsParSpecialite();
    this.loadSpecialites();
  }

  loadSpecialites(): void {
    this.adminService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les spécialités';
      }
    });
  }

  loadCandidats(): void {
    this.loading = true;
    this.adminService.getCandidats().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.candidats = data ;
        this.loading = false;
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }



  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCandidat = null; // Important pour que le filtre du HTML ne bloque rien
    this.candidatForm.reset({ specialiteId: '' });
    this.showModal = true;
  }


  openEditModal(candidat: any): void {
    this.isEditMode = true;
    this.selectedCandidat = candidat;

    // On retire le validateur 'required' pour le mot de passe en mode édition
    this.candidatForm.get('password')?.setValidators([]);
    this.candidatForm.get('password')?.updateValueAndValidity();

    const formattedDate = candidat.dateNais ? candidat.dateNais.toString().substring(0, 10) : '';

    this.candidatForm.patchValue({
      nom: candidat.nom,
      prenom: candidat.prenom,
      username: candidat.username,
      dateNais: formattedDate,
      specialiteId: candidat.specialite?.idSpecialite
    });

    this.candidatForm.markAsPristine(); // ⭐ important

    this.showModal = true;
    this.cdr.detectChanges();
  }
  viewCandidat(candidat: any): void {
    this.selectedCandidat = candidat;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCandidat = null;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedCandidat = null;
  }

  onSubmit(): void {



    if (this.candidatForm.valid) {
      this.loading = true;
      const formData = this.candidatForm.value;

      console.log("Données envoyées au service :", formData);
      if (this.isEditMode) {
        this.adminService.updateCandidat(this.selectedCandidat.id, formData).subscribe({
          next: () => {
            this.successMessage = 'Candidat modifié';
            this.loadCandidatsParSpecialite();
            //this.loadCandidats();
            this.closeModal();
            this.loading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: () => {
            this.errorMessage = 'Erreur modification';
            this.loading = false;
          }
        });
      } else {
        this.adminService.createCandidat(formData).subscribe({
          next: () => {
            this.successMessage = 'Candidat ajouté';
            this.loadCandidatsParSpecialite();
            //this.loadCandidats();
            this.closeModal();
            this.loading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: () => {
            this.errorMessage = 'Erreur ajout';
            this.loading = false;
          }
        });
      }
    }
  }

  toggleStatus(candidat: any): void {
    // On réinitialise les messages pour éviter les confusions
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.toggleCandidatStatus(candidat.id).subscribe({
      next: (updated: any) => {
        // 1. Mise à jour de l'objet local avec la réponse du serveur
        //candidat.statut = updated.statut;

        this.loadCandidatsParSpecialite();

        // 2. Message de succès dynamique
        this.successMessage = updated.statut ? 'Candidat activé avec succès' : 'Candidat désactivé';

        // 3. Forcer Angular à redessiner le composant (très important avec les modales/tableaux)
        this.cdr.detectChanges();

        // 4. Nettoyage du message après 3 secondes
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges(); // On rafraîchit après disparition du message
        }, 3000);
      },
      error: (err) => {
        console.error('Erreur toggleStatus:', err);
        this.errorMessage = 'Impossible de changer le statut du candidat.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteCandidat(id: number): void {
    if (confirm('Supprimer ce candidat?')) {
      this.adminService.deleteCandidat(id).subscribe({
        next: () => {
          this.successMessage = 'Candidat supprimé';
          this.loadCandidatsParSpecialite();
          //this.loadCandidats();
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  onCheckboxChange(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedCandidats.push(id);
    } else {
      this.selectedCandidats = this.selectedCandidats.filter(i => i !== id);
    }
  }

  selectAll(event: any): void {
    if (event.target.checked) {
      this.selectedCandidats = this.candidats.map(c => c.id);
    } else {
      this.selectedCandidats = [];
    }
  }

  activateSelected(): void {
    if (this.selectedCandidats.length > 0) {
      this.adminService.activateMultiple(this.selectedCandidats).subscribe({
        next: () => {
          this.successMessage = 'Candidats activés';
          this.loadCandidatsParSpecialite();
          //this.loadCandidats();
          this.selectedCandidats = [];
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  deactivateSelected(): void {
    if (this.selectedCandidats.length > 0) {
      this.adminService.deactivateMultiple(this.selectedCandidats).subscribe({
        next: () => {
          this.successMessage = 'Candidats désactivés';
          this.loadCandidatsParSpecialite();
          //this.loadCandidats();
          this.selectedCandidats = [];
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  isAllSelected(): boolean {
    return this.candidats.length > 0 && this.selectedCandidats.length === this.candidats.length;
  }

  specialitesCandidats: any = {};
//ajouter---
  loadCandidatsParSpecialite(): void {
    this.loading = true;
    this.adminService.getCandidatsBySpecialite().subscribe({
      next: (data) => {
        this.specialitesCandidats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
