
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DirecteurLayoutComponent } from './features/dashboard/directeur/layout/directeur-layout.component';
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
import {ParametreComponent} from './features/parametre/parametre.component'
import {ModuleTenantComponent} from './features/dashboard/adminTenant/ListeModuleTenant/ModuleTenant.component'
import {ListeModuleTenantComponent} from './features/dashboard/adminTenant/ListeModuleTenant/ListeModuleTenant.component'
import {ListeModuleComponent} from './features/dashboard/directeur/ListeModule/ListeModule.component'
import {AffichageListeComponent} from './features/dashboard/directeur/ListeModule/AffichageListe.component'


import { SessionInscComponent} from './features/dashboard/adminTenant/session-insc/session-insc.component';

import { DashboardCandidatComponent } from './features/dashboard/candidat/dashboard/dashboard.component';
import { CandidatLayoutComponent } from './features/dashboard/candidat/layout/layout.component';
import { ModulesCandidatComponent } from './features/dashboard/candidat/modules/modules.component';
import { MesInscriptionsComponent } from './features/dashboard/candidat/modules/mes-inscriptions.component';
import { DemarrerTestComponent } from './features/dashboard/candidat/test/demarrer-test/demarrer-test.component';
import { QcmComponent } from './features/dashboard/candidat/test/qcm/qcm.component';
import { ResultatsSessionsComponent } from './features/dashboard/admin/resultats-sessions/resultats-sessions.component';
import { ImportGmetrixComponent } from './features/dashboard/admin/import-gmetrix/import-gmetrix.component';
import { SessionExamenComponent } from './features/dashboard/admin/SessionExamen/session-examen.component';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'super-admin',
    component: SuperAdminComponent,
    canActivate: [authGuard],
    children: [
      { path: 'tenants', component: TenantComponent },
      { path: 'adminTenants', component: ListeAdminsTenantComponent },
      { path: 'categories', component: CategorieModuleComponent },
      { path: 'modules', component: ModuleComponent },
      { path: 'questions/:id', component: QuestionComponent },
      { path: 'parametre', component: ParametreComponent }
    ]
  },

  {
    path: 'candidat',
    component: CandidatLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardCandidatComponent },
      { path: 'modules', component: ModulesCandidatComponent },
      { path: 'mes-inscriptions', component: MesInscriptionsComponent },
      //{ path: 'reservations', component: ReservationComponent },

      {
        path: 'demarrer-test/:sessionId/:moduleTenantId',
        component: DemarrerTestComponent
      },
      { path: 'qcm', component: QcmComponent },

      { path: 'parametre', component: ParametreComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    component: homeAdminComponent,
    canActivate: [authGuard],
    children: [

      { path: 'candidats', component: AdminComponent },
       { path: 'parametre', component: ParametreComponent },
      { path: 'resultats-sessions', component: ResultatsSessionsComponent },
      { path: 'import-gmetrix', component: ImportGmetrixComponent },
       { path: 'sessionsExamen', component: SessionExamenComponent }

    ]
  },
  {
    path: 'directeur',
    component: DirecteurLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'administrateurs', component: AdministrateursComponent },
      { path: 'specialites', component: SpecialiteComponent },
       { path: 'parametre', component: ParametreComponent },
       { path: 'modules', component: ListeModuleComponent },
       { path: 'Listemodules', component: AffichageListeComponent }

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
       { path: 'parametre', component: ParametreComponent },
       { path: 'modules', component: ModuleComponent },
       { path: 'moduleTenant', component: ModuleTenantComponent },
       { path: 'ListeModuleTenant', component: ListeModuleTenantComponent },
      //{ path: 'quotas', component: QuotasComponent },
      //{ path: 'session-test', component: SessionTestComponent },
      { path: 'session-insc', component: SessionInscComponent }
    ]
  },


  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: '**', redirectTo: 'login' }
];
