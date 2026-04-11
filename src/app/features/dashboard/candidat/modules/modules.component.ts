import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';

@Component({
  selector: 'app-modules-candidat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
/*export class ModulesCandidatComponent implements OnInit {

  // Données brutes venant du backend
  modulesAffectes: any[] = [];
  modulesOuverts: any[] = [];

  // Liste filtrée réellement affichée dans le HTML
  displayedModules: any[] = [];

  mode: string = 'fixe';
  showAll = false;
  search: string = '';

  constructor(
    private service: ModuleCandidatService,
    private authService: AuthService,private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }


  loadModules(): void {
    this.service.getModules().subscribe({
      next: (res: any) => {
        console.log("Données reçues du backend :", res);

        // Sécurisation de la lecture du mode (ouvert / fixe)
        this.mode = res.mode ? res.mode.toLowerCase() : 'fixe';

        this.modulesAffectes = res.modulesAffectes || [];
        this.modulesOuverts = res.modulesOuverts || [];

        // Initialiser l'affichage
        this.applyFilter();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des modules', err);
      }
    });
  }


  applyFilter(): void {
    // 1. On détermine la liste de base selon le mode et l'état du bouton "showAll"
    let baseList = [...this.modulesAffectes];

    // On utilise .includes pour gérer "ouvert" ou "ouverte"
    if (this.mode.includes('ouvert') && this.showAll) {
      baseList = [...baseList, ...this.modulesOuverts];
    }

    // 2. On applique le filtre de recherche textuelle
    if (!this.search.trim()) {
      this.displayedModules = baseList;
    } else {
      const searchLow = this.search.toLowerCase();

      this.displayedModules = baseList.filter(m => {
        // Recherche dans le nom du module
        const matchNom = m.module?.nom?.toLowerCase().includes(searchLow);

        // Recherche dans les mots-clés (description ou valeur)
        const matchMotCle = (m.module?.motCles || []).some((mc: any) => {
          const desc = mc.description ? mc.description.toLowerCase() : '';
          const val = mc.valeur ? mc.valeur.toLowerCase() : '';
          return desc.includes(searchLow) || val.includes(searchLow);
        });

        return matchNom || matchMotCle;
      });
    }

    console.log(`Affichage mis à jour : ${this.displayedModules.length} modules affichés.`);
    this.cdr.detectChanges();
  }


  toggleAutres(): void {
    this.showAll = !this.showAll;
    this.applyFilter();
  }
}*/

// ... imports identiques ...

export class ModulesCandidatComponent implements OnInit {
  modulesAffectes: any[] = [];
  modulesOuverts: any[] = []; // Ceux-là restent séparés

  displayedModules: any[] = []; // Liste filtrée des affectés
  filteredOuverts: any[] = [];  // Liste filtrée des autres

  mode: string = 'fixe';
  showAll = false;
  search: string = '';

  constructor(
    private service: ModuleCandidatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.service.getModules().subscribe({
      next: (res: any) => {
        this.mode = res.mode ? res.mode.toLowerCase() : 'fixe';
        this.modulesAffectes = res.modulesAffectes || [];
        this.modulesOuverts = res.modulesOuverts || [];
        this.applyFilter();
      },
      error: (err) => console.error('Erreur', err)
    });
  }

  applyFilter(): void {
    const searchLow = this.search.toLowerCase();

    // 1. Filtrer les modules affectés
    this.displayedModules = this.modulesAffectes.filter(m => this.matchSearch(m, searchLow));

    // 2. Filtrer les autres modules
    this.filteredOuverts = this.modulesOuverts.filter(m => this.matchSearch(m, searchLow));

    this.cdr.detectChanges();
  }

  // Fonction utilitaire pour éviter de répéter le code du filtre
  private matchSearch(m: any, searchLow: string): boolean {
    if (!searchLow.trim()) return true;
    const nom = m.module?.nom?.toLowerCase() || '';
    const matchMotCle = (m.module?.motCles || []).some((mc: any) =>
      mc.description?.toLowerCase().includes(searchLow)
    );
    return nom.includes(searchLow) || matchMotCle;
  }

  toggleAutres(): void {
    this.showAll = !this.showAll;
    this.cdr.detectChanges();
  }
}
