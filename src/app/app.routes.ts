/*import { Routes } from '@angular/router';

export const routes: Routes = [];
*/

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DirecteurComponent } from './features/dashboard/directeur/directeur.component';
import { CandidatComponent } from './features/dashboard/candidat/candidat.component';
import { AdminComponent } from './features/dashboard/admin/admin.component';
import { homeAdminComponent } from './features/dashboard/admin/homeAdmin.component';
import { SuperAdminComponent } from './features/dashboard/SuperAdmin/super-admin.component';
import { TenantComponent } from './features/dashboard/SuperAdmin/tenant.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Routes spécifiques d'abord
  {
    path: 'super-admin',
    component: SuperAdminComponent,
    canActivate: [authGuard],
    children: [
      { path: 'tenants', component: TenantComponent }
     // { path: 'admins', component: AdminListComponent }, // Si vous avez un composant pour la liste des admins
      //{ path: 'stats', component: SuperAdminStatsComponent }, // Vos graphiques/cartes
     // { path: '', redirectTo: 'tenants', pathMatch: 'full' } // Route par défaut
    ]
  },
  //{ path: 'tenant', component: AdminTenantComponent, canActivate: [authGuard] },
  { path: 'directeur', component: DirecteurComponent, canActivate: [authGuard] },
  { path: 'candidat', component: CandidatComponent, canActivate: [authGuard] },

  {
    path: 'dashboard',
    component: homeAdminComponent,
    canActivate: [authGuard],
    children: [

      { path: 'candidats', component: AdminComponent }
      //{ path: '', redirectTo: 'candidats', pathMatch: 'full' }
    ]
  },

  // Redirection de la racine vers le login (ou dashboard selon votre logique)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // TOUJOURS EN DERNIER : Capture les erreurs 404
  { path: '**', redirectTo: 'login' }
];
