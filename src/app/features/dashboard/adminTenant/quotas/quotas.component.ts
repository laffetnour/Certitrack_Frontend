import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quotas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quotas.component.html',
  styleUrls: ['../ListeModuleTenant/ModuleTenant.component.css']
})
export class QuotasComponent implements OnInit {

  myModules: any[] = [];
  filteredMyModules: any[] = [];

  loading: boolean = false;
  errorMessage: string = '';

  searchTerm: string = '';
  testFilter: string = '';

  userId!: number;

  constructor(
    private moduleTenantService: ModuleTenantService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    console.log(user);
    this.userId = user?.idUtilisateur;

    this.loadModules();
  }

  // 🔹 Charger uniquement modules ACTIFS
  loadModules(): void {
    this.loading = true;

    this.moduleTenantService.getActiveModules(this.userId).subscribe({
      next: (data) => {
        this.myModules = data.map(mt => ({
          ...mt,
          capaciteInitiale: mt.capacite // 🔥 pour gérer bouton
        }));

        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Erreur chargement modules";
        this.loading = false;
      }
    });
  }

  // 🔹 Modifier capacité
  updateCapacite(mt: any): void {
    if (mt.capacite === null || mt.capacite === undefined) {
      alert("Veuillez entrer une capacité");
      return;
    }

    this.moduleTenantService.updateCapacite(mt.id, mt.capacite).subscribe({
      next: (updatedMt: any) => {

        // 🔥 mise à jour valeur initiale → bouton se désactive
        mt.capaciteInitiale = updatedMt.capacite;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert("Erreur mise à jour capacité");
      }
    });
  }

  // 🔹 FILTRES
  applyFilters(): void {
    this.filteredMyModules = this.myModules.filter(mt => {

      const matchesSearch = mt.module.nom
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      let matchesTest = true;
      if (this.testFilter === 'with') matchesTest = mt.avecTest === true;
      if (this.testFilter === 'without') matchesTest = mt.avecTest === false;

      return matchesSearch && matchesTest;
    });
  }

}
