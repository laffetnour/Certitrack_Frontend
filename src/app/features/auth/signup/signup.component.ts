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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { EtablissementService } from '../../../core/services/etablissement.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  etablissements:any[]=[];
  errorMsg = '';
  successMsg = '';
  isLoading: boolean = false;

  constructor( private fb: FormBuilder,
               private authService: AuthService,
               private etablissementService:EtablissementService,
               private router: Router){}
  ngOnInit(){

    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required, Validators.minLength(6)],

      numTel:['',Validators.required],
      emailPersonnel:['',[Validators.required,Validators.email]],

      etablissementId:['',Validators.required],
      dateNais: ['', Validators.required]
    });

    this.loadEtablissements();
  }

  loadEtablissements(){

    this.etablissementService.getEtablissements().subscribe({

      next:data=>{
        this.etablissements=data;
      },

      error:err=>{
        console.error(err);
      }

    });

  }

  onSubmit(){

    if(this.signupForm.invalid){
      this.signupForm.markAllAsTouched();
      return;
    }

    const formValue = { ...this.signupForm.value };
    if (!formValue.etablissementId) {
      this.errorMsg = "Veuillez choisir un établissement.";
      return;
    }
    formValue.etablissementId = Number(formValue.etablissementId);
    console.log("Payload envoyé :", formValue);

    this.isLoading = true;
    this.authService.register(formValue).subscribe({
      next: res => {
        this.isLoading = false;
        alert("Inscription réussie");
        this.router.navigate(['/login']);
      },


      error:err=>{

        this.isLoading=false;

        this.errorMsg="Erreur lors de l'inscription";

        console.error(err);

      }

    });

  }

}
