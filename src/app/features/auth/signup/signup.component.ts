import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
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
  verificationCodeInput: string = '';


  constructor( private fb: FormBuilder,
               private authService: AuthService,
               private etablissementService:EtablissementService,
               private cdr: ChangeDetectorRef,
               private router: Router){}

ngOnInit() {
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
      if (id) {
        this.loadSpecialites(id);
      }
    });

    this.loadEtablissements();
  }

onSendCode() {
  console.log("Tentative d'envoi du code...");
  console.log("Statut du formulaire :", this.signupForm.status);

  if (this.signupForm.invalid) {
    console.warn("Formulaire invalide ! Liste des erreurs :", this.signupForm.errors);
    // On affiche les erreurs de chaque champ dans la console pour trouver le coupable
    Object.keys(this.signupForm.controls).forEach(key => {
      const controlErrors = this.signupForm.get(key)?.errors;
      if (controlErrors != null) {
        console.log('Champ Erreur:', key, controlErrors);
      }
    });
    this.signupForm.markAllAsTouched();
    this.errorMsg = "Veuillez remplir correctement tous les champs.";
    return;
  }


  this.isLoading = true;
  const email = this.signupForm.get('username')?.value;

  this.authService.sendCode(email).subscribe({
    next: () => {
      console.log("Code envoyé avec succès au backend");
      this.isLoading = false;
      this.isVerificationStep = true;
      this.errorMsg = '';
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Erreur Backend lors de l'envoi :", err);
      this.isLoading = false;
      this.errorMsg = "Le serveur ne répond pas. Vérifiez votre connexion.";
    }
  });
}

  // --- ÉTAPE 2 : VALIDATION FINALE ---
onSubmit() {
  this.isLoading = true;
  this.errorMsg = '';

  const formValue = {
    ...this.signupForm.value,
    verificationCode: this.verificationCodeInput
  };

  this.authService.register(formValue).subscribe({
    next: (res) => {
      this.isLoading = false;
      alert("Félicitations ! Inscription réussie.");
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.isLoading = false;
      alert("Code incorrect ! Un nouveau code va vous être envoyé.");

      this.verificationCodeInput = ''; // On vide le champ

      // On déclenche le renvoi
      const email = this.signupForm.get('username')?.value;
      this.authService.sendCode(email).subscribe({
        next: () => {
          // Petit message de succès pour rassurer l'utilisateur
          this.errorMsg = "Un nouveau code a été envoyé. Veuillez vérifier vos mails.";
        }
      });
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


}
