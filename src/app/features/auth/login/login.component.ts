import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { ThemeService } from '../../../core/services/Theme.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  errorMessage = '';
  message: string = '';
  isError: boolean = false;
  showForgotForm = false;
  forgotEmail = '';

  token: string = '';
  emailCheck: string = '';
  newPassword: string = '';
  step: number = 1;


  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    public configService: ConfigService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.validateAccount(token);
    }
  }

  validateAccount(token: string) {
    this.auth.verifyAccount(token).subscribe({
      next: (res) => {
        this.message = "✅ Votre adresse e-mail a été vérifiée. Votre compte est en attente de validation par votre établissement.";
        this.isError = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message = "❌ Le lien de validation est invalide ou a expiré.";
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

 login() {
   this.errorMessage = '';
   this.message = '';

   this.auth.login(this.username, this.password).subscribe({
     next: (res: any) => {
       this.auth.saveUser(res);
       localStorage.setItem('token', res.token);

       const userId = res.idUtilisateur || res.id;

       this.configService.getConfigByUserId(userId).subscribe({
         next: (config) => {
           if (config && config.theme) {
             this.themeService.applyTheme(config.theme);
           }
           this.handleNavigation(res.role);
         },
         error: (err) => {
           console.error("Erreur récup config, redirection par défaut", err);
           this.handleNavigation(res.role);
         }
       });
     },
     error: (error: HttpErrorResponse) => {
       const serverMessage = error.error?.message;
       if (serverMessage === "ETABLISSEMENT_DISABLED") {
         this.errorMessage = "⚠️ L'établissement de votre compte est désactivé.";
       } else if (serverMessage === "TENANT_DISABLED") {
         this.errorMessage = "🚫 Votre organisation est désactivée.";
       } else if (serverMessage === "USER_DISABLED") {
         this.errorMessage = "🚫 Votre compte personnel est désactivé.";
       } else {
         this.errorMessage = "Identifiants incorrects ou erreur de connexion.";
       }
       this.cdr.detectChanges();
     }
   });
 }

 private handleNavigation(role: string) {
   const routes: { [key: string]: string } = {
     'directeurEtab': '/directeur/dashboard',
     'Candidat': '/candidat',
     'adminEtab': '/admin',
     'superAdmin': '/super-admin',
     'adminTenant': '/adminTenant'
   };

   const targetRoute = routes[role] || '/';
   this.router.navigate([targetRoute]);
 }




requestReset() {
  this.isError = false;
  this.message = "Envoi du lien en cours... ✉️";
  this.cdr.detectChanges();

  this.auth.requestPasswordReset(this.forgotEmail).subscribe({
    next: () => {
      this.isError = false;
      this.message = "✅ Le lien de réinitialisation a été envoyé à votre adresse e-mail.";

      this.forgotEmail = '';

      this.cdr.detectChanges();


      setTimeout(() => {
        this.showForgotForm = false;
        this.message = '';
        this.cdr.detectChanges();
      }, 5000);

    },
    error: (err) => {
      // 4. Erreur : On informe l'utilisateur
      this.isError = true;
      if (err.status === 404) {
        this.message = "❌ Aucun compte n'est associé à cet e-mail.";
      } else {
        this.message = "❌ Une erreur est survenue. Veuillez réessayer plus tard.";
      }
      this.cdr.detectChanges();
    }
  });
}




}
