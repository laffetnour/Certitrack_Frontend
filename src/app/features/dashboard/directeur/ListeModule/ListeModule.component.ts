import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './ListeModule.component.html',
  styleUrls: ['./ListeModule.component.css']
})
export class ListeModuleComponent implements OnInit {
   myModules: any[] = [];
    loading: boolean = false;
     errorMessage: string = '';

      filteredModules: any[] = [];
      searchTerm: string = '';
      categoryFilter: string = '';
        categories: string[] = [];
      selectedIds = new Set<number>();

      submitting: boolean = false;

    constructor(
      private moduleTenantService: ModuleTenantService,
      private cdr: ChangeDetectorRef,
      private authService: AuthService
    ) {}

    ngOnInit(): void {
      this.loadMyCatalogue();
    }

loadMyCatalogue(): void {
  this.loading = true;
  const user = this.authService.getUser();
 const userId = user?.idUtilisateur;
  console.log(user);
  if (!userId) {
    this.errorMessage = "Impossible de récupérer les informations du Tenant.";
    this.loading = false;
    return;
  }
  this.moduleTenantService.getMyModules(userId).subscribe({
    next: (data: any[]) => {

      this.myModules = [...data];
      console.log(data);
      this.onSearch();
      this.categories = [...new Set(data.map(mt => mt.module.nomCategorie))].filter(c => c);


      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.errorMessage = "Erreur lors de la récupération des modules du catalogue.";
      this.loading = false;
    }
  });
}

onSearch(): void {
  const term = this.searchTerm.toLowerCase().trim();

  this.filteredModules = this.myModules.filter(mt => {
    // CONDITION CHANGÉE : On veut uniquement les modules ACTIVÉS
    const isActive = mt.estActif === true;

    // Recherche par NOM du module
    const matchName = mt.module.nom.toLowerCase().includes(term);

    // Recherche par MOTS-CLÉS
    const matchTags = mt.module.motCles?.some((tag: any) =>
      tag.description.toLowerCase().includes(term)
    );

    // Filtre par CATÉGORIE (via le select)
    const matchCatSelect = !this.categoryFilter || mt.module.nomCategorie === this.categoryFilter;

    // On retourne le résultat
    return isActive && (matchName || matchTags) && matchCatSelect;
  });

  this.selectedIds.clear();
}
}
