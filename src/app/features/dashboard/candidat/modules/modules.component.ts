import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';

import { AuthService } from '../../../../core/services/auth.service';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';
/*import { ConfigService } from '../../../../core/services/config.service';*/



@Component({
  selector: 'app-modules-candidat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})


export class ModulesCandidatComponent implements OnInit {
  modulesAffectes: any[] = [];
  modulesOuverts: any[] = [];
  displayedModules: any[] = [];
  filteredOuverts: any[] = [];
  mode: string = 'fixe';
  showAll = false;
  search: string = '';
  isSubmitting = false;

  filterType: string = 'all';
  filterStatus: string = 'all';
  currentView: 'affectes' | 'autres' = 'affectes';

  constructor(
    private service: ModuleCandidatService,
    private moduleTenantService: ModuleTenantService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
    /*public configService: ConfigService*/
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

showOthers: boolean = false;
 applyFilter(): void {
    const searchLow = this.search.toLowerCase().trim();

    this.displayedModules = this.modulesAffectes.filter(m => this.checkAllFilters(m, searchLow));
    this.filteredOuverts = this.modulesOuverts.filter(m => this.checkAllFilters(m, searchLow));

    this.cdr.detectChanges();
  }

  // On garde cette variable pour mémoriser le dernier module cliqué
  lastInscribedModuleId: number | null = null;

  private checkAllFilters(m: any, searchLow: string): boolean {
      // 1. CACHER le module sur lequel on vient de cliquer
      if (this.lastInscribedModuleId && m.module?.idModule === this.lastInscribedModuleId) {
          return false;
      }



      // 2. Filtres de recherche et de type
      const matchesSearch = this.matchSearch(m, searchLow);

      let matchesType = true;
      if (this.filterType === 'withTest') matchesType = m.avecTest === true;
      if (this.filterType === 'noTest') matchesType = m.avecTest === false;

      let matchesStatus = true;
      if (this.filterStatus === 'open') matchesStatus = m.hasActiveSession === true;

      return matchesSearch && matchesType && matchesStatus;
  }



    private matchSearch(m: any, searchLow: string): boolean {

      if (!searchLow) return true;

      const nom = m.module?.nom?.toLowerCase() || '';
      const categorie = m.module?.nomCategorie?.toLowerCase() || '';
      const matchMotCle = (m.module?.motCles || []).some((mc: any) =>
        (mc.description || mc.libelle || '').toLowerCase().includes(searchLow)
      );
      return nom.includes(searchLow) ||
             categorie.includes(searchLow) ||
             matchMotCle;
    }

    /*toggleAutres(): void {
      this.showAll = !this.showAll;
      this.cdr.detectChanges();
    }*/
  goToAutres() {
    this.currentView = 'autres';
    this.cdr.detectChanges();
  }

  goBack() {
    this.currentView = 'affectes';
    this.cdr.detectChanges();
  }
/*

loadModules() {
  this.service.getModules().subscribe({
    next: (res: any) => {
      this.mode = res.mode ? res.mode.trim().toUpperCase() : 'FIXE';

      this.modulesAffectes = res.modulesAffectes || [];
      this.modulesOuverts = res.modulesOuverts || [];

      this.applyFilter();
    },
    error: (err) => console.error('Erreur de chargement', err)
  });
}


sinscrire(item: any): void {
  // On utilise la clé exacte validée dans Postman
  const sessionId = item.sessionIdValide;

  if (!sessionId) {
    alert("Désolé, aucune session n'est ouverte pour ce module actuellement.");
    return;
  }

  if (confirm(`Confirmer l'inscription au module : ${item.module?.nom} ?`)) {
    this.isSubmitting = true;
    this.service.inscrire(sessionId).subscribe({
      next: (res) => {
        alert("Inscription réussie !");
        this.isSubmitting = false;
        this.loadModules(); // Recharge la liste pour masquer le module inscrit
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || "Erreur lors de l'inscription.");
      }
    });
  }
}*/

loadModules() {
  this.service.getModules().subscribe({
    next: (res: any) => {
      // 1. On récupère le mode
      this.mode = res.mode ? res.mode.trim().toUpperCase() : 'FIXE';

      // 2. IMPORTANT : On met à jour les listes avec les nouvelles données du serveur
      // Le serveur exclut déjà les modules présents dans 'inscriptionsIds'
      this.modulesAffectes = res.modulesAffectes || [];
      this.modulesOuverts = res.modulesOuverts || [];

      // 3. On relance le filtrage pour mettre à jour 'displayedModules' et 'filteredOuverts'
      this.applyFilter();

      // Force Angular à voir le changement si nécessaire
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Erreur de chargement des modules', err);
    }
  });
}



// modules.component.ts

sinscrire(item: any): void {
  // 1. On récupère les deux IDs nécessaires
  const sessionId = item.sessionIdValide;
  const moduleTenantId = item.idModuleTenant; // Clé présente dans ton map Java

  if (!sessionId || !moduleTenantId) {
    alert("Impossible de procéder à l'inscription : données manquantes.");
    return;
  }

  if (confirm(`Confirmer l'inscription au module : ${item.module?.nom} ?`)) {
    this.isSubmitting = true;

    this.service.inscrire(sessionId, moduleTenantId).subscribe({
      next: (res) => {
        alert("Inscription réussie !");
        this.isSubmitting = false;

        this.loadModules();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || "Erreur lors de l'inscription.");
      }
    });
  }
}
}
