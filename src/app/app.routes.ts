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
import { TenantComponent } from './features/dashboard/tenant/tenant.component';
import { authGuard } from './core/guards/auth.guard';

/*export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: 'directeur', component: DirecteurComponent, canActivate: [authGuard] },
  { path: 'candidat', component: CandidatComponent, canActivate: [authGuard] },
  //{ path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  {
    path: 'dashboard',
    component: homeAdminComponent, // Celui qui contient la sidebar et <router-outlet>
    children: [
      {
        path: 'candidats', // Accessible via /dashboard/candidats
        component: AdminComponent // Celui qui contient le tableau admin.component.html
      },
      {
        path: '', // Route par défaut quand on arrive sur /dashboard
        redirectTo: 'candidats',
        pathMatch: 'full'
      }
    ]
  },
  // Redirection par défaut si aucune route ne match
  { path: '', redirectTo: '/dashboard/candidats', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard/candidats' },
  { path: 'super-admin', component: SuperAdminComponent, canActivate: [authGuard] },
  { path: 'tenant', component: TenantComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];*/

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Routes spécifiques d'abord
  { path: 'super-admin', component: SuperAdminComponent, canActivate: [authGuard] },
  { path: 'tenant', component: TenantComponent, canActivate: [authGuard] },
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
