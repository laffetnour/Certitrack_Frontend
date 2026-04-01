/*import { Routes } from '@angular/router';

export const routes: Routes = [];
*/

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DirecteurLayoutComponent } from './features/dashboard/directeur/layout/directeur-layout.component';

import { CandidatComponent } from './features/dashboard/candidat/candidat.component';
import { AdminComponent } from './features/dashboard/admin/admin.component';
import { homeAdminComponent } from './features/dashboard/admin/homeAdmin.component';
import { SuperAdminComponent } from './features/dashboard/SuperAdmin/super-admin.component';
import { TenantComponent } from './features/dashboard/SuperAdmin/tenant.component';
import{ListeAdminsTenantComponent} from './features/dashboard/SuperAdmin/listeAdminTenant.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/directeur/dashboard/dashboard.component';
import { DashboardTenantComponent} from './features/dashboard/adminTenant/dashboard/DashboardTenant.component'
import { AdministrateursComponent } from './features/dashboard/directeur/administrateurs/administrateurs.component';
import { SpecialiteComponent } from './features/dashboard/directeur/specialites/specialite.component';
import { DirecteursComponent } from './features/dashboard/adminTenant/directeurs/directeurs.component';
import { AdminTenantLayoutComponent } from './features/dashboard/adminTenant/layout/layout.component';
import { CategorieModuleComponent } from './features/dashboard/SuperAdmin/categorieModule/categorie-module.component';
import { ModuleComponent } from './features/dashboard/SuperAdmin/Module/module.component';
import { EtablissementsComponent } from './features/dashboard/adminTenant/etablissements/etablissements.component';
import {QuestionComponent} from './features/dashboard/SuperAdmin/Question/question.component'
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Routes spécifiques d'abord
  {
    path: 'super-admin',
    component: SuperAdminComponent,
    canActivate: [authGuard],
    children: [
      { path: 'tenants', component: TenantComponent },
      { path: 'adminTenants', component: ListeAdminsTenantComponent }, // Si vous avez un composant pour la liste des admins
      { path: 'categories', component: CategorieModuleComponent },
      { path: 'modules', component: ModuleComponent },
      { path: 'questions', component: QuestionComponent }
     // { path: '', redirectTo: 'tenants', pathMatch: 'full' } // Route par défaut
    ]
  },
  //{ path: 'tenant', component: AdminTenantComponent, canActivate: [authGuard] },

  { path: 'candidat', component: CandidatComponent, canActivate: [authGuard] },

  {
    path: 'dashboard',
    component: homeAdminComponent,
    canActivate: [authGuard],
    children: [

      { path: 'candidats', component: AdminComponent }

    ]
  },
  {
    path: 'directeur',
    component: DirecteurLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'administrateurs', component: AdministrateursComponent },
      { path: 'specialites', component: SpecialiteComponent }

    ]
  },
  {
    path: 'adminTenant',
    component: AdminTenantLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardTenantComponent },
      { path: 'directeurs', component: DirecteursComponent },
      { path: 'etablissements', component: EtablissementsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },


  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: '**', redirectTo: 'login' }
];
