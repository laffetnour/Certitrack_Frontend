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

        console.log("Token enregistré :", res.token);
        const role = res.role;

        if (role === 'directeurEtab') this.router.navigate(['/directeur']);
        if (role === 'Candidat') this.router.navigate(['/candidat']);
        if (role === 'adminEtab') this.router.navigate(['//dashboard']);
        if (role === 'superAdmin') this.router.navigate(['/super-admin']);
        if (role === 'adminTenant') this.router.navigate(['/adminTenant']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.errorMessage = "Votre compte n'est pas encore validé. Veuillez attendre la validation de l'administrateur.";
        } else if (error.status === 401) {
          this.errorMessage = "Nom d'utilisateur ou mot de passe incorrect !";
        } else {
          this.errorMessage = error.error?.message || "Une erreur est survenue";
        }

        this.cdr.detectChanges();
      }
    });
  }
}
