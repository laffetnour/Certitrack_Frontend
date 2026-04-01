import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}


login() {
  this.errorMessage = '';

  this.auth.login(this.username, this.password).subscribe({
    next: (res: any) => {
      this.auth.saveUser(res);
      localStorage.setItem('token', res.token);

      const role = res.role;

      if (role === 'directeurEtab') this.router.navigate(['/directeur/dashboard']);
      if (role === 'Candidat') this.router.navigate(['/candidat']);
      if (role === 'adminEtab') this.router.navigate(['/dashboard']);
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
