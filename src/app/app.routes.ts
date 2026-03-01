/*import { Routes } from '@angular/router';

export const routes: Routes = [];
*/

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DirecteurComponent } from './features/dashboard/directeur/directeur.component';
import { CandidatComponent } from './features/dashboard/candidat/candidat.component';
import { AdminComponent } from './features/dashboard/admin/admin.component';
import { SuperAdminComponent } from './features/dashboard/SuperAdmin/super-admin.component';
import { TenantComponent } from './features/dashboard/tenant/tenant.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: 'directeur', component: DirecteurComponent, canActivate: [authGuard] },
  { path: 'candidat', component: CandidatComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'super-admin', component: SuperAdminComponent, canActivate: [authGuard] },
  { path: 'tenant', component: TenantComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
