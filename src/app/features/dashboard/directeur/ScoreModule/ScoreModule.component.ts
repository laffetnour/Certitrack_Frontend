import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-seuils-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ScoreModule.component.html',
  styleUrls: ['./ScoreModule.component.css']
})
export class SeuilsManagementComponent implements OnInit {
  allModules: any[] = [];
  modulesSansSeuil: any[] = [];
  searchTerm: string = '';
  filterStatus: string = 'missing';
  showModal: boolean = false;
  selectedModule: any = null;
  tempSeuil: number | null = null;
  loading: boolean = false;
  userId: number = 0;

  constructor(private moduleTenantService: ModuleTenantService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService) {}

  ngOnInit() {

    this.rafraichir();
  }

  rafraichir() {
    this.loading = true;
    const user = this.authService.getUser();
    const userId = user?.idUtilisateur;
    this.moduleTenantService.getMyModules(userId).subscribe({
      next: (data) => {
        this.allModules = data;
        this.modulesSansSeuil = data.filter(m => m.seuilScore === null || m.seuilScore === 0);
         this.loading = false;
         this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement modules", err)
    });
  }

  filteredModules() {
    return this.allModules.filter(m => {
      const nomModule = m.module?.nom || m.nom || '';
      const matchSearch = nomModule.toLowerCase().includes(this.searchTerm.toLowerCase());

      if (this.filterStatus === 'missing') return matchSearch && (m.seuilScore === null || m.seuilScore === 0);
      if (this.filterStatus === 'defined') return matchSearch && m.seuilScore > 0;
      return matchSearch;
    });
  }

  ouvrirModal(mod: any) {
    this.selectedModule = mod;
    this.tempSeuil = mod.seuilScore;
    this.showModal = true;
  }

  sauvegarder() {
    if (this.selectedModule && this.tempSeuil !== null) {
      this.moduleTenantService.configTest(
        this.selectedModule.id,
        true,
        this.tempSeuil,
        this.selectedModule.capacite
      ).subscribe({
        next: () => {
          this.showModal = false;
          this.cdr.detectChanges();
          this.rafraichir();
        },
        error: (err) => alert("Erreur lors de la mise à jour du seuil")
      });
    }
  }

  supprimerSeuil(mod: any) {
    if(confirm('Voulez-vous supprimer le seuil ?')) {
      this.moduleTenantService.configTest(mod.id, false, null, mod.capacite).subscribe({
        next: () => this.rafraichir()
      });
    }
  }
}
