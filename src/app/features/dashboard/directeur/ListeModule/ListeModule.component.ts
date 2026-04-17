import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EtablissementService } from '../../../../core/services/etablissement.service';
import { SpecialiteModuleService } from '../../../../core/services/SpecialiteModule.service';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs'; // <--- INDISPENSABLE


@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ListeModule.component.html',
  styleUrls: ['./ListeModule.component.css']
})
export class ListeModuleComponent implements OnInit {
   myModules: any[] = [];
    loading: boolean = false;
     errorMessage: string = '';

      filteredModules: any[] = [];
      allModulesData: any[] = [];
      searchTerm: string = '';
      categoryFilter: string = '';
        categories: string[] = [];
      selectedIds = new Set<number>();
      selectedModuleIds = new Set<number>();

      submitting: boolean = false;

      showModal: boolean = false;
        selectedModule: any = null;
        allSpecialities: any[] = []; // Liste brute des spécialités du tenant
        specSearchTerm: string = '';
        selectedSpecIds = new Set<number>();
        alreadyAssignedSpecIds: number[] = [];

        targetType: 'TOUS' | 'PAR_SPEC' = 'TOUS';
        listMode: 'FIXE' | 'OUVERTE' = 'FIXE';

    constructor(
      private moduleTenantService: ModuleTenantService,
      private cdr: ChangeDetectorRef,
      private etablissementService: EtablissementService,
      private specialiteModuleService: SpecialiteModuleService,
      private authService: AuthService
    ) {}

    ngOnInit(): void {
      this.loadMyCatalogue();
      this.loadSpecialities();
    }

loadAllSpecModules(): void {
    this.loading = true;
        const user = this.authService.getUser();
        const etabId = user?.etablissements?.[0]?.idEtab;

         if (etabId) {
  this.specialiteModuleService.getAllSpecialiteModules(etabId).subscribe({
    next: (data) => { this.allModulesData = data; },
    error: (err) => console.error("Erreur technique lors de la récupération des modes", err)
  });
}}
loadMyCatalogue(): void {
  this.loading = true;
  const user = this.authService.getUser();
 const userId = user?.idUtilisateur;
  console.log(user);
  /*if (!userId) {
    this.errorMessage = "Impossible de récupérer les informations du Tenant.";
    this.loading = false;
    return;
  }*/

const etabId = user?.etablissements?.[0]?.idEtab;

  if (etabId) {
    // 1. On charge d'abord les spécialités de l'établissement
    this.etablissementService.getSpecialites(etabId).subscribe({
      next: (specs) => {
        this.allSpecialities = specs;
  this.moduleTenantService.getMyModules(userId).subscribe({
    next: (data: any[]) => {

      this.myModules = [...data];
      console.log(data);
      this.onSearch();
      this.categories = [...new Set(data.map(mt => mt.module.nomCategorie))].filter(c => c);


      this.loading = false;
      this.cdr.detectChanges();
   },   error: (err) => {
           this.errorMessage = "Erreur lors de la récupération des modules du catalogue.";
           this.loading = false;
         }
       });
         }
       });
}}

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

loadSpecialities(): void {
    const user = this.authService.getUser();
    const etabId = user?.etablissements?.[0]?.idEtab;
    console.log("etab: ",etabId);
    if (etabId) {
        this.etablissementService.getSpecialites(etabId).subscribe({
          next: (specs) => {
            this.allSpecialities = specs;
            console.log("Spécialités chargées :", specs);
          },
          error: (err) => console.error("Erreur lors du chargement des spécialités", err)
        });
      } else {
        console.warn("Aucun ID d'établissement trouvé pour cet utilisateur.");
      }
  }

  openAssignmentModal(module: any): void {
    this.selectedModule = module;
    this.showModal = true;
    this.selectedSpecIds.clear();
    this.targetType = 'TOUS';
    this.listMode = 'FIXE';
  }


  closeModal(): void {
    this.showModal = false;
  }

filteredSpecialities() {
  if (!this.specSearchTerm) {
    return this.allSpecialities;
  }
  return this.allSpecialities.filter(s =>
    s.nom.toLowerCase().includes(this.specSearchTerm.toLowerCase())
  );
}

toggleSpec(id: number): void {
  if (this.selectedSpecIds.has(id)) {
    this.selectedSpecIds.delete(id);
  } else {
    this.selectedSpecIds.add(id);
  }

  }


/*


confirmAssignment(): void {
  const user = this.authService.getUser();

  // 1. Récupérer les spécialités cibles
  const selectedSpecsIds = this.targetType === 'TOUS'
    ? this.allSpecialities.map(s => s.idSpecialite)
    : Array.from(this.selectedSpecIds);

  // 2. Récupérer les modules à traiter
  let modulesToProcess: any[] = [];
  if (this.selectedModule) {
    modulesToProcess = [this.selectedModule];
  } else {
    modulesToProcess = this.myModules.filter(m => this.selectedModuleIds.has(m.id));
  }

  if (selectedSpecsIds.length === 0 || modulesToProcess.length === 0) return;

  this.submitting = true;

  // 3. Création des requêtes individuelles par spécialité
  const requests = selectedSpecsIds.map(specId => {

    // --- RECHERCHE DU MODE DANS LES DONNÉES EXISTANTES ---
    let modeDetecte = 'FIXE'; // Par défaut

    // On parcourt TOUS les modules du catalogue pour voir si l'un d'eux
    // est déjà affecté à cette spécialité (specId)
    const moduleAvecCetteSpec = this.myModules.find(m =>
      m.specialiteModules?.some((sm: any) => sm.specialite.idSpecialite === specId)
    );

    if (moduleAvecCetteSpec) {
      // On cherche la liaison spécifique pour extraire son mode
      const liaison = moduleAvecCetteSpec.specialiteModules.find((sm: any) => sm.specialite.idSpecialite === specId);
      if (liaison && liaison.modeAffichage) {
        modeDetecte = liaison.modeAffichage;
      }
    }

    const payload = {
      specialiteIds: [specId], // On isole chaque spécialité
      moduleTenantIds: modulesToProcess.map(m => m.id),
      modeAffichage: modeDetecte,
      ajoutePar: user?.nom || 'Directeur'
    };



    console.log(`📡 Envoi Spec ${specId} avec mode auto-détecté : ${modeDetecte}`);
    return this.specialiteModuleService.affecterModules(payload);
  });

  // 4. Envoi groupé
  forkJoin(requests).subscribe({
    next: () => {
      alert("Affectation réussie ! Les modes ont été synchronisés sur l'existant.");
      this.loadMyCatalogue(); // Recharge le tableau pour voir les changements
      this.loadAllSpecModules();
      this.closeModal();
      this.selectedModuleIds.clear();
      this.submitting = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error("Erreur :", err);
      alert("Une erreur est survenue lors de l'affectation.");
      this.submitting = false;
      this.cdr.detectChanges();
    }
  });
}*/




confirmAssignment(): void {
  const user = this.authService.getUser();

  // 1. Déterminer les spécialités cibles
  const selectedSpecsIds = this.targetType === 'TOUS'
    ? this.allSpecialities.map(s => s.idSpecialite)
    : Array.from(this.selectedSpecIds);

  // 2. Déterminer les modules à traiter
  let modulesToProcess: any[] = [];
  if (this.selectedModule) {
    modulesToProcess = [this.selectedModule];
  } else {
    modulesToProcess = this.myModules.filter(m => this.selectedModuleIds.has(m.id));
  }

  if (selectedSpecsIds.length === 0 || modulesToProcess.length === 0) return;

  // --- LOGIQUE DES ALERTS ET RAPPORTS ---
  let totalAdded = 0;
  let reportLines: string[] = [];

  modulesToProcess.forEach(m => {
    let alreadyLinkedSpecsForThisModule: string[] = [];

    selectedSpecsIds.forEach(specId => {
      const isAlreadyLinked = m.specialiteModules?.some((sm: any) => sm.specialite.idSpecialite === specId);
      const specName = this.allSpecialities.find(s => s.idSpecialite === specId)?.nom;

      if (isAlreadyLinked) {
        alreadyLinkedSpecsForThisModule.push(specName);
      } else {
        totalAdded++;
      }
    });

    if (alreadyLinkedSpecsForThisModule.length > 0) {
      reportLines.push(`• ${m.module.nom} : déjà affecté à (${alreadyLinkedSpecsForThisModule.join(', ')})`);
    }
  });

  // Si ABSOLUMENT RIEN à ajouter après vérification des doublons
  if (totalAdded === 0) {
    alert("Opération annulée : Toutes les sélections sont déjà affectées.\n\n" + reportLines.join('\n'));
    return;
  }

  this.submitting = true;

  // --- CRÉATION DES REQUÊTES AVEC DÉTECTION DE MODE ---
  const requests = selectedSpecsIds.map(specId => {

    // Détection du mode pour cette spécialité précise (RSI, etc.)
    let modeDetecte = 'FIXE';
    const moduleAvecCetteSpec = this.myModules.find(m =>
      m.specialiteModules?.some((sm: any) => sm.specialite.idSpecialite === specId)
    );

    if (moduleAvecCetteSpec) {
      const liaison = moduleAvecCetteSpec.specialiteModules.find((sm: any) => sm.specialite.idSpecialite === specId);
      if (liaison && liaison.modeAffichage) {
        modeDetecte = liaison.modeAffichage;
      }
    }

    const payload = {
      specialiteIds: [specId],
      moduleTenantIds: modulesToProcess.map(m => m.id),
      modeAffichage: modeDetecte,
      ajoutePar: user?.nom || 'Directeur'
    };

    return this.specialiteModuleService.affecterModules(payload);
  });

  // --- ENVOI GROUPÉ ET ALERT FINAL ---
  forkJoin(requests).subscribe({
    next: () => {
      let msg = "L'affectation a été traitée avec succès ! Les modes ont été harmonisés sur l'existant.";

      if (reportLines.length > 0) {
        msg += "\n\nNote (Doublons ignorés) :\n" + reportLines.join('\n');
      }

      alert(msg);

      this.loadMyCatalogue();
      this.loadAllSpecModules();
      this.closeModal();
      this.selectedModuleIds.clear();
      this.submitting = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error("Erreur d'affectation :", err);
      alert("Erreur lors de l'affectation.");
      this.submitting = false;
      this.cdr.detectChanges();
    }
  });
}
isInvalid(): boolean {
  // 1. Si on est en train d'envoyer, on bloque
  if (this.submitting) return true;

  // 2. Si on est en mode "Par spécialité"
  if (this.targetType === 'PAR_SPEC') {
    // Si aucune spécialité n'est cochée manuellement, c'est invalide
    return this.selectedSpecIds.size === 0;
  }

  // 3. Par défaut c'est valide (pour le mode "TOUS")
  return false;
}

// 2. Sélectionner/Désélectionner un module
toggleModuleSelection(id: number): void {
  if (this.selectedModuleIds.has(id)) {
    this.selectedModuleIds.delete(id);
  } else {
    this.selectedModuleIds.add(id);
  }
}

// 3. Sélectionner/Désélectionner tout le tableau filtré
toggleAll(event: any): void {
  if (event.target.checked) {
    this.filteredModules.forEach(m => this.selectedModuleIds.add(m.id));
  } else {
    this.selectedModuleIds.clear();
  }
}

isAllSelected(): boolean {
  return this.filteredModules.length > 0 && this.selectedModuleIds.size === this.filteredModules.length;
}

// 4. Ouvrir la modale pour la sélection multiple
/*openBulkAssignmentModal(): void {
  if (this.selectedModuleIds.size === 0) return;
  this.selectedModule = null; // Indique qu'on est en mode multiple
  this.showModal = true;
  this.selectedSpecIds.clear();
  this.targetType = 'TOUS';
}*/


openBulkAssignmentModal(): void {
  if (this.selectedModuleIds.size === 0) return;

  this.selectedModule = null; // Mode multiple
  this.showModal = true;
  this.selectedSpecIds.clear();
  this.specSearchTerm = '';
  this.targetType = 'TOUS';
  this.listMode = 'FIXE';

  // Optionnel : vider les IDs déjà affectés car on ne peut pas
  // les calculer facilement pour plusieurs modules à la fois
  this.alreadyAssignedSpecIds = [];
}


// Vérifie si une spécialité donnée est déjà liée au module sélectionné
isAlreadyAssigned(specId: number): boolean {
  // Si aucun module n'est sélectionné, on retourne faux
  if (!this.selectedModule || !this.selectedModule.specialiteModules) {
    return false;
  }

  // On cherche dans la liste des spécialités déjà affectées au module
  return this.selectedModule.specialiteModules.some(
    (sm: any) => sm.specialite.idSpecialite === specId
  );
}






isSpecFromMyEtab(sm: any): boolean {
  // Si le module n'a pas de spécialité ou si ma liste locale est vide, on n'affiche rien
  if (!sm.specialite || !this.allSpecialities || this.allSpecialities.length === 0) {
    return false;
  }

  // On vérifie si l'ID de la spécialité du module (ex: ID 6 pour DSI)
  // est présent dans ma liste de spécialités autorisées (ex: IDs 11 et 12 pour A et B)
  return this.allSpecialities.some(s => s.idSpecialite === sm.specialite.idSpecialite);
}



/**
 * Vérifie si le module possède au moins une spécialité
 * appartenant à l'établissement du directeur connecté.
 */
hasVisibleSpec(m: any): boolean {
  // Si le module n'a pas de spécialités rattachées, on retourne false
  if (!m.specialiteModules || m.specialiteModules.length === 0) {
    return false;
  }

  // On utilise la fonction isSpecFromMyEtab pour voir s'il y en a au moins une de visible
  return m.specialiteModules.some((sm: any) => this.isSpecFromMyEtab(sm));
}
}

