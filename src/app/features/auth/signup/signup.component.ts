/*import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {

  user = {
    nom: '',
    prenom: '',
    username: '',
    password: '',
    nomEtablissement: ''
  };

  constructor(private auth: AuthService) {}

  signup() {
    this.auth.signup(this.user).subscribe({
      next: () => alert("Inscription réussie"),
      error: (err) => alert(err.error)
    });
  }
}
*/

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMsg = '';
  successMsg = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      nomEtablissement: ['', Validators.required]
    });
  }

  /*onSubmit() {
    if (this.signupForm.valid) {
      this.authService.register(this.signupForm.value).subscribe({
        next: (res) => console.log('Token:', res.token),
        error: (err) => console.error(err)
      });
    }
  }*/
  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMsg = '';
      this.authService.register(this.signupForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          // Succès : Message et redirection vers Login
          this.successMsg = "Inscription réussie !";
          alert("Compte créé avec succès. Redirecting...");
          this.router.navigate(['/login']);
        },
        error: (err) =>{
          this.isLoading = false;
          this.errorMsg = "Erreur lors de l'inscription. Vérifiez vos données.";
          console.error(err);
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
