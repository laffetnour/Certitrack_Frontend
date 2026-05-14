import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  styleUrls: ['./resetPassword.component.css'],
  templateUrl: './resetPassword.component.html'
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  emailCheck: string = '';
  newPassword: string = '';
  step: number = 1;
  message: string = '';
  isError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.isError = true;
      this.message = "Lien invalide (token manquant).";
      this.cdr.detectChanges();
    }
  }

  verifyEmail() {
    this.auth.verifyResetIdentity(this.token, this.emailCheck).subscribe({
      next: () => {
        this.step = 2;
        this.message = "Identité confirmée. Saisissez votre nouveau mot de passe.";
        this.isError = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isError = true;
        this.message = "L'email ne correspond pas au compte associé à ce lien.";
        this.cdr.detectChanges();
      }
    });
  }

  submitNewPassword() {
    this.auth.resetPasswordFinal(this.token, this.newPassword).subscribe({
      next: () => {
        this.message = "Mot de passe modifié avec succès ! Redirection...";
        this.isError = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isError = true;
        this.message = "Une erreur est survenue (lien expiré ?).";
        this.cdr.detectChanges();
      }
    });
  }
}
