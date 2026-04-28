

import { Component, OnInit } from '@angular/core'; // Ajout de OnInit
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
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

  // Variables pour le message de validation par mail
  message: string = '';
  isError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService, // Tu as nommé ton service 'auth' ici
    private router: Router,
    public configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Extraction du token depuis l'URL (ex: /login?token=...)
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.validateAccount(token);
    }
  }

  validateAccount(token: string) {
    // Correction : Utilisation de 'this.auth' au lieu de 'this.authService'
    this.auth.verifyAccount(token).subscribe({
      next: (res) => {
        // L'utilisateur est maintenant enregistré en BDD côté Backend
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

         const role = res.role;

         if (role === 'directeurEtab') this.router.navigate(['/directeur/dashboard']);
         if (role === 'Candidat') this.router.navigate(['/candidat']);
         if (role === 'adminEtab') this.router.navigate(['/admin']);
         if (role === 'superAdmin') this.router.navigate(['/super-admin']);
         if (role === 'adminTenant') this.router.navigate(['/adminTenant']);
       },
      error: (error: HttpErrorResponse) => {

        const serverMessage = error.error?.message;
        console.log("Message reçu enfin :", serverMessage);

        if (serverMessage === "ETABLISSEMENT_DISABLED") {
          this.errorMessage = "⚠️ L'établissement de votre compte est désactivé.";
        }
        else if(serverMessage === "TENANT_DISABLED") {
          this.errorMessage = "🚫 Votre organisation est désactivée.";
        }
        else if (serverMessage === "USER_DISABLED") {
          this.errorMessage = "🚫 Votre compte personnel est désactivé.";
        } else {
          this.errorMessage = "Identifiants incorrects ou erreur de connexion.";
        }
        this.cdr.detectChanges();
      }
     });
   }
}
