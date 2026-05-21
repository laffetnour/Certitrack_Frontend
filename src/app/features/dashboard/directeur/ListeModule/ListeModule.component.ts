import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModuleTenantService } from '../../../../core/services/ModuleTenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EtablissementService } from '../../../../core/services/etablissement.service';
import { SpecialiteModuleService } from '../../../../core/services/SpecialiteModule.service';
import { FormsModule } from '@angular/forms';
import { ContextService } from '../../../../core/services/context.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';


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
        allSpecialities: any[] = [];
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
      private contextService: ContextService,
      private authService: AuthService
    ) {}

    ngOnInit(): void {
      this.loadMyCatalogue();
      this.loadSpecialities();
    }

    getRetourRoute(): string {
      const idEtab = this.contextService.getEtablissementId();
      const user = this.authService.getUser();
        const role = user?.role

        if (role === 'superAdmin' || role === 'SUPER_ADMIN') {
            const idTenant = this.contextService.getTenantId();
            if (idTenant && idEtab) {
              return `/super-admin/tenant/${idTenant}/etablissement/${idEtab}/specialites`;
            }
          }

      if (role === 'adminTenant' && idEtab) {
        return `/adminTenant/etablissement/${idEtab}/specialites`;
      }

      return '/directeur/specialites';
    }

    loadAllSpecModules(): void
    {
        this.loading = true;
            const user = this.authService.getUser();
            const etabId = user?.etablissements?.[0]?.idEtab || this.contextService.getEtablissementId() ||  user?.etablissement?.idEtab;
              console.log("all : ",etabId);
             if (etabId)
             {
                this.specialiteModuleService.getAllSpecialiteModules(etabId).subscribe({
                  next: (data) => { this.allModulesData = data; },
                  error: (err) => console.error("Erreur technique lors de la récupération des modes", err)
                });
             }
    }
    loadMyCatalogue(): void
    {
      this.loading = true;
      const user = this.authService.getUser();
     const userId = user?.idUtilisateur;
      console.log(user);


    const etabId = user?.etablissements?.[0]?.idEtab || this.contextService.getEtablissementId() ||  user?.etablissement?.idEtab;

      if (etabId) {

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
      }
    }

    onSearch(): void {
      const term = this.searchTerm.toLowerCase().trim();

      this.filteredModules = this.myModules.filter(mt => {
        const isActive = mt.estActif === true;
        const matchName = mt.module.nom.toLowerCase().includes(term);
        const matchTags = mt.module.motCles?.some((tag: any) =>
          tag.description.toLowerCase().includes(term)
        );

        const matchCatSelect = !this.categoryFilter || mt.module.nomCategorie === this.categoryFilter;
        return isActive && (matchName || matchTags) && matchCatSelect;
      });

      this.selectedIds.clear();
    }

    loadSpecialities(): void {
        const user = this.authService.getUser();
        const etabId = user?.etablissements?.[0]?.idEtab || this.contextService.getEtablissementId() ||  user?.etablissement?.idEtab;
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



    confirmAssignment(): void {
      const user = this.authService.getUser();
      const selectedSpecsIds = this.targetType === 'TOUS'
        ? this.allSpecialities.map(s => s.idSpecialite)
        : Array.from(this.selectedSpecIds);

      let modulesToProcess: any[] = [];
      if (this.selectedModule) {
        modulesToProcess = [this.selectedModule];
      } else {
        modulesToProcess = this.myModules.filter(m => this.selectedModuleIds.has(m.id));
      }

      if (selectedSpecsIds.length === 0 || modulesToProcess.length === 0) return;

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

      if (totalAdded === 0) {
        alert("Opération annulée : Toutes les sélections sont déjà affectées.\n\n" + reportLines.join('\n'));
        return;
      }

      this.submitting = true;

      const requests = selectedSpecsIds.map(specId => {
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
      if (this.submitting) return true;
      if (this.targetType === 'PAR_SPEC') {
        return this.selectedSpecIds.size === 0;
      }

      return false;
    }

    toggleModuleSelection(id: number): void {
      if (this.selectedModuleIds.has(id)) {
        this.selectedModuleIds.delete(id);
      } else {
        this.selectedModuleIds.add(id);
      }
    }

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


    openBulkAssignmentModal(): void {
      if (this.selectedModuleIds.size === 0) return;

      this.selectedModule = null;
      this.showModal = true;
      this.selectedSpecIds.clear();
      this.specSearchTerm = '';
      this.targetType = 'TOUS';
      this.listMode = 'FIXE';
      this.alreadyAssignedSpecIds = [];
    }


    isAlreadyAssigned(specId: number): boolean {
      if (!this.selectedModule || !this.selectedModule.specialiteModules) {
        return false;
      }
      return this.selectedModule.specialiteModules.some(
        (sm: any) => sm.specialite.idSpecialite === specId
      );
    }

    isSpecFromMyEtab(sm: any): boolean {
      if (!sm.specialite || !this.allSpecialities || this.allSpecialities.length === 0) {
        return false;
      }

      return this.allSpecialities.some(s => s.idSpecialite === sm.specialite.idSpecialite);
    }

    hasVisibleSpec(m: any): boolean {
      if (!m.specialiteModules || m.specialiteModules.length === 0) {
        return false;
      }

      return m.specialiteModules.some((sm: any) => this.isSpecFromMyEtab(sm));
    }
}

