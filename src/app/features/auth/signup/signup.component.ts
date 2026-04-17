import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ConfigService } from '../../../core/services/config.service';

import { EtablissementService } from '../../../core/services/etablissement.service';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  etablissements:any[]=[];
  specialites:any[]=[];
  errorMsg = '';
  successMsg = '';
  isLoading: boolean = false;

  isVerificationStep: boolean = false;
  isSuccessStep: boolean = false;
  verificationCodeInput: string = '';


  constructor( private fb: FormBuilder,
               private authService: AuthService,
               private etablissementService:EtablissementService,
               private cdr: ChangeDetectorRef,
               private router: Router,
               public configService: ConfigService,
                private route: ActivatedRoute){}




    ngOnInit() {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (token) {
          this.verifyUserToken(token);
        } else {

          this.initSignupForm();
          this.loadEtablissements();
        }
      }


initSignupForm() {
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      numTel: ['', Validators.required],
      emailPersonnel: ['', [Validators.required, Validators.email]],
      specialiteId: ['', Validators.required],
      etablissementId: ['', Validators.required],
      dateNais: ['', Validators.required],
    });

    this.signupForm.get('etablissementId')?.valueChanges.subscribe(id => {
          this.specialites = [];
          this.signupForm.get('specialiteId')?.setValue('');

          if (id) {
            this.loadSpecialites(id);
          }
    });
  }


verifyUserToken(token: string) {
    this.isLoading = true;
    this.authService.verifyAccount(token).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccessStep = true;
        this.successMsg = "Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.";
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = "Le lien de confirmation est invalide ou a expiré.";
        this.cdr.detectChanges();
      }
    });
  }


onSendVerificationLink() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.errorMsg = "Veuillez remplir correctement tous les champs.";
      return;
    }

    this.isLoading = true;
    this.errorMsg = ''; // On réinitialise l'erreur

    this.authService.sendVerificationLink(this.signupForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.isVerificationStep = true;
        this.errorMsg = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;

        // --- LOGIQUE DE VÉRIFICATION D'EXISTENCE ---
        // Si ton backend renvoie une erreur 409 ou un message spécifique
        if (err.status === 409 || err.error?.message === "EMAIL_EXISTS") {
          this.errorMsg = "⚠️ Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser un autre email.";
        } else {
          this.errorMsg = "Une erreur est survenue lors de l'envoi du mail de vérification.";
        }

        this.cdr.detectChanges();
      }
    });
}



  loadEtablissements(){

    this.etablissementService.getAll().subscribe({

      next:data=>{
        console.log("Établissements reçus :", data);
        this.etablissements=data;
        this.cdr.detectChanges();
      },

      error:err=>{
        console.error(err);
      }

    });

  }



  loadSpecialites(id:number){

    this.etablissementService.getSpecialites(id).subscribe({
      next:data=>{
        console.log("SPECIALITES RECUES :",data); // IMPORTANT
        this.specialites=data;
      },
      error:err=>{
        console.error("ERREUR API :",err);
      }
    });

  }

backToForm() {
    this.isVerificationStep = false;
    this.errorMsg = '';
  }
}
