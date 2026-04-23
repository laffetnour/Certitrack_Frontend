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
  tenantConfig: any = null;


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
      identifiantSpecifique: ['']
    });

    this.signupForm.get('etablissementId')?.valueChanges.subscribe(id => {
          this.specialites = [];
          this.tenantConfig = null;
          this.signupForm.get('specialiteId')?.setValue('');

          if (id) {
            const etab = this.etablissements.find(e => e.idEtab == id);
            console.log("etab : ", etab);
            if (etab && etab.tenant) {
              this.tenantConfig = etab.tenant;
              console.log("this.tenantConfig : ", this.tenantConfig);
              this.updateDynamicValidators();
              this.cdr.detectChanges();
            }
            this.loadSpecialites(id);
          }
    });

  }

/*updateDynamicValidators() {
    const ctrl = this.signupForm.get('identifiantSpecifique');
    if (!this.tenantConfig || this.tenantConfig.typeIdentifiant === 'EMAIL') {
      ctrl?.clearValidators();
    } else {
      const validators = [Validators.required];
      if (this.tenantConfig.longueurIdentifiant) {
        validators.push(Validators.minLength(this.tenantConfig.longueurIdentifiant));
        validators.push(Validators.maxLength(this.tenantConfig.longueurIdentifiant));
      }
      ctrl?.setValidators(validators);
    }
    ctrl?.updateValueAndValidity();
}*/

updateDynamicValidators() {
  const ctrl = this.signupForm.get('identifiantSpecifique');
  if (!this.tenantConfig || this.tenantConfig.typeIdentifiant === 'EMAIL') {
    ctrl?.clearValidators();
  } else {
    const validators = [Validators.required];
    const len = this.tenantConfig.longueurIdentifiant;

    if (len) {
      validators.push(Validators.minLength(len), Validators.maxLength(len));
    }

    let pattern = '';
    if (this.tenantConfig.formatIdentifiant === 'NUMERIC') {
      pattern = '^[0-9]*$';
    } else if (this.tenantConfig.formatIdentifiant === 'ALPHA') {

      pattern = '^([a-zA-Z]*|[0]*)$';
    } else if (this.tenantConfig.formatIdentifiant === 'ALPHANUMERIC') {
            validators.push((control) => {
              const val = control.value;
              if (!val) return null;

              const allZeros = /^0+$/.test(val);
              const hasLetter = /[a-zA-Z]/.test(val);
              const hasDigit = /[0-9]/.test(val);
              const isPureAlpha = /^[a-zA-Z]+$/.test(val);
              const isPureDigit = /^[0-9]+$/.test(val);

              if (allZeros) return null;

              if (hasLetter && hasDigit) return null;

              return { alphanumericMix: true };
            });
          }

    if (pattern) {
      validators.push(Validators.pattern(pattern));
    }

    ctrl?.setValidators(validators);
  }
  ctrl?.updateValueAndValidity();
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


  onDigitInput(event: any, index: number) {
    const inputs = document.querySelectorAll('.otp-input');
    const value = (event.target as HTMLInputElement).value;

    if (value && index < inputs.length - 1) {
      (inputs[index + 1] as HTMLElement).focus();
    } else if (event.key === 'Backspace' && index > 0) {
      (inputs[index - 1] as HTMLElement).focus();
    }

    let fullValue = '';
    inputs.forEach((input: any) => fullValue += input.value);

    this.signupForm.patchValue({
      identifiantSpecifique: fullValue
    });
  }

  onDigitPaste(event: ClipboardEvent) {
    event.preventDefault();
    const data = event.clipboardData?.getData('text').split('') || [];
    const inputs = document.querySelectorAll('.otp-input');

    data.forEach((char, i) => {
      if (i < inputs.length) {
        (inputs[i] as HTMLInputElement).value = char;
      }
    });

    this.signupForm.patchValue({
      identifiantSpecifique: data.join('').substring(0, inputs.length)
    });
  }
}
