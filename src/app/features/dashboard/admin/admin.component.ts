import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ConfigService } from '../../../core/services/config.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],  // Important!
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  candidats: any[] = [];
  selectedCandidats: number[] = [];
  showModal = false;
  showViewModal = false;
  isEditMode = false;
  selectedCandidat: any = null;

  candidatForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  specialites: any[] = [];
  tenantConfig: any = null;
  idDigits: string[] = [];

  allCandidats: any[] = [];
  filteredCandidats: any[] = [];
  selectedFilterSpecialite: string = 'all';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    public configService: ConfigService
  ) {
    this.candidatForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateNais: ['', Validators.required],

      specialiteId: ['', Validators.required],
      identifiantSpecifique: ['']
    });
  }

  ngOnInit(): void {


    const user = this.auth.getUser();
        if (user && user.etablissements && user.etablissements[0]?.tenant) {
          this.tenantConfig = user.etablissements[0].tenant;
          this.idDigits = new Array(this.tenantConfig.longueurIdentifiant || 8).fill('');
          this.applyAdminValidators();
        }
    this.loadCandidatsParSpecialite();
    this.loadSpecialites();

  }


  loadSpecialites(): void {
    this.adminService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les spécialités';
      }
    });
  }

  loadCandidats(): void {
    this.loading = true;
    this.adminService.getCandidats().subscribe({
      next: (data) => {
        this.candidats = data ;
        console.log(data);
        this.loading = false;
        this.cdr.detectChanges();

      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }




  viewCandidat(candidat: any): void {
    this.selectedCandidat = candidat;
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCandidat = null;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedCandidat = null;
  }

  onSubmit(): void {

    if (this.candidatForm.valid) {
      this.loading = true;
      const formData = this.candidatForm.value;
      this.errorMessage = '';
      if (this.isEditMode) {
        this.adminService.updateCandidat(this.selectedCandidat.id, formData).subscribe({
          next: () => {
            this.successMessage = 'Candidat modifié';
            this.loadCandidatsParSpecialite();

            this.closeModal();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            //this.errorMessage = 'Erreur modification';
            this.handleError(err)
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.adminService.createCandidat(formData).subscribe({
          next: () => {
            this.successMessage = 'Candidat ajouté avec succès';
            this.loadCandidatsParSpecialite();

            this.closeModal();
            this.loading = false;
            this.cdr.detectChanges();
            //setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
            this.handleError(err);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

private handleError(err: any): void {


  if (err.status === 403 || err.status === 409) {
      this.errorMessage = "📧 Cet email est déjà utilisé par un autre utilisateur.";
    }
    else if (err.status === 400) {
      this.errorMessage = "⚠️ Données invalides. Veuillez vérifier le format de l'email.";
    }
    else {
      this.errorMessage = "❌ Une erreur est survenue lors de l'enregistrement.";
    }

    this.cdr.detectChanges();
}

  toggleStatus(candidat: any): void {

    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.toggleCandidatStatus(candidat.id).subscribe({
      next: (updated: any) => {


        this.loadCandidatsParSpecialite();


        this.successMessage = updated.statut
                ? 'Candidat activé et notifié par email'
                : 'Candidat désactivé et notifié par email';
              this.cdr.detectChanges();


        this.cdr.detectChanges();


        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Impossible de changer le statut du candidat.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteCandidat(id: number): void {
    if (confirm('Supprimer ce candidat?')) {
      this.adminService.deleteCandidat(id).subscribe({
        next: () => {
          this.successMessage = 'Candidat supprimé';
          this.loadCandidatsParSpecialite();

          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  onCheckboxChange(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedCandidats.push(id);
    } else {
      this.selectedCandidats = this.selectedCandidats.filter(i => i !== id);
    }
  }

  selectAll(event: any): void {
    if (event.target.checked) {
      this.selectedCandidats = this.candidats.map(c => c.id);
    } else {
      this.selectedCandidats = [];
    }
  }

  activateSelected(): void {
    if (this.selectedCandidats.length > 0) {
      this.adminService.activateMultiple(this.selectedCandidats).subscribe({
        next: () => {
          this.successMessage = 'Candidats activés';
          this.loadCandidatsParSpecialite();

          this.selectedCandidats = [];
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  deactivateSelected(): void {
    if (this.selectedCandidats.length > 0) {
      this.adminService.deactivateMultiple(this.selectedCandidats).subscribe({
        next: () => {
          this.successMessage = 'Candidats désactivés';
          this.loadCandidatsParSpecialite();

          this.selectedCandidats = [];
          setTimeout(() => this.successMessage = '', 3000);
        }
      });
    }
  }

  isAllSelected(): boolean {
    return this.candidats.length > 0 && this.selectedCandidats.length === this.candidats.length;
  }

  specialitesCandidats: any = {};

  /*loadCandidatsParSpecialite(): void {
    this.loading = true;
    this.adminService.getCandidatsBySpecialite().subscribe({
      next: (data) => {
        this.specialitesCandidats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }*/

loadCandidatsParSpecialite(): void {
  this.loading = true;
  this.adminService.getCandidatsBySpecialite().subscribe({
    next: (data) => {
      this.specialitesCandidats = data;

      // Aplatir l'objet en une liste unique de candidats
      this.allCandidats = [];
      Object.values(data).forEach((list: any) => {
        this.allCandidats.push(...list);
      });

      this.applyFilter(); // Initialise la liste filtrée
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.errorMessage = 'Erreur lors du chargement';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

applyFilter(): void {
  if (this.selectedFilterSpecialite === 'all') {
    this.filteredCandidats = [...this.allCandidats];
  } else {
    this.filteredCandidats = this.allCandidats.filter(c =>
      c.specialite?.nom === this.selectedFilterSpecialite
    );
  }
}

onDigitInput(event: any, index: number) {
    const inputs = document.querySelectorAll('.otp-input');
    const value = (event.target as HTMLInputElement).value;

    // Gestion du focus suivant
    if (value && index < inputs.length - 1) {
      (inputs[index + 1] as HTMLElement).focus();
    }
    // Note: Le backspace est mieux géré dans onKeyDown pour éviter les conflits d'events

    this.syncFullValue();
  }

  // Ajout du support Backspace comme dans ta version précédente pour la navigation fluide
  onKeyDown(event: KeyboardEvent, index: number) {
    const inputs = document.querySelectorAll('.otp-input');
    if (event.key === 'Backspace' && !(event.target as HTMLInputElement).value && index > 0) {
      (inputs[index - 1] as HTMLElement).focus();
    }
  }

  onDigitPaste(event: ClipboardEvent) {
    event.preventDefault();
    const data = event.clipboardData?.getData('text').split('') || [];
    const inputs = document.querySelectorAll('.otp-input');

    data.forEach((char, i) => {
      if (i < inputs.length) {
        (inputs[i] as HTMLInputElement).value = char;
        this.idDigits[i] = char; // On garde le tableau idDigits à jour
      }
    });

    this.syncFullValue();
  }

  private syncFullValue() {
    const inputs = document.querySelectorAll('.otp-input');
    let fullValue = '';
    inputs.forEach((input: any) => fullValue += input.value);

    const ctrl = this.candidatForm.get('identifiantSpecifique');
    if (ctrl) {
      ctrl.setValue(fullValue);
      ctrl.markAsTouched(); // Indispensable pour que le HTML affiche l'erreur
      ctrl.markAsDirty();
      ctrl.updateValueAndValidity(); // Force le recalcul des validateurs (pattern, minlength, etc.)
    }
    this.cdr.detectChanges(); // Force le rafraîchissement de la vue
  }

  applyAdminValidators() {
    const ctrl = this.candidatForm.get('identifiantSpecifique');
    if (this.tenantConfig && this.tenantConfig.typeIdentifiant !== 'EMAIL') {
      const format = this.tenantConfig.formatIdentifiant;
      const len = this.tenantConfig.longueurIdentifiant;

      const validators = [
        Validators.required,
        Validators.minLength(len),
        Validators.maxLength(len)
      ];

      validators.push((control) => {
        const val = control.value;
        if (!val) return null;

        const allZeros = /^0+$/.test(val);
        const hasLetter = /[a-zA-Z]/.test(val);
        const hasDigit = /[0-9]/.test(val);

        if (format === 'NUMERIC' && hasLetter) return { numericOnly: true };
        if (format === 'ALPHA' && hasDigit && !allZeros) return { alphaOnly: true };

        if (format === 'ALPHANUMERIC') {
          if (allZeros) return null;
          if (!(hasLetter && hasDigit)) return { alphanumericMix: true };
        }
        return null;
      });

      ctrl?.setValidators(validators);
    }
    ctrl?.updateValueAndValidity();
  }

  // MODALS
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCandidat = null;
    this.errorMessage = '';
    this.candidatForm.reset({ specialiteId: '' });

    const longueur = this.tenantConfig?.longueurIdentifiant || 8;
    this.idDigits = new Array(longueur).fill('');

    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(candidat: any): void {
    this.isEditMode = true;
    this.selectedCandidat = candidat;
    this.errorMessage = '';

    this.candidatForm.get('password')?.setValidators([]);
    this.candidatForm.get('password')?.updateValueAndValidity();

    const formattedDate = candidat.dateNais ? candidat.dateNais.toString().substring(0, 10) : '';

    const longueurAttendue = this.tenantConfig?.longueurIdentifiant || 8;
    if (candidat.identifiantSpecifique) {
      const chars = candidat.identifiantSpecifique.split('');
      this.idDigits = new Array(longueurAttendue).fill('').map((_, i) => chars[i] || '');
    } else {
      this.idDigits = new Array(longueurAttendue).fill('');
    }

    this.candidatForm.patchValue({
      nom: candidat.nom,
      prenom: candidat.prenom,
      username: candidat.username,
      dateNais: formattedDate,
      specialiteId: candidat.specialite?.idSpecialite,
      identifiantSpecifique: candidat.identifiantSpecifique
    });

    this.showModal = true;
    this.cdr.detectChanges();
  }


  exportToExcel(): void {
    const inactifs = this.allCandidats.filter(c => c.statut === false || !c.statut);

    if (inactifs.length === 0) {
      this.errorMessage = "Aucun candidat inactif à exporter.";
      return;
    }

    const dataToExport = inactifs.map(c => ({
      'Nom': c.nom,
      'Prénom': c.prenom,
      'Email': c.username,
      'Spécialité': c.specialite?.nom || 'N/A',
      //'Établissement': c.nomEtablissement,
      [this.tenantConfig?.labelIdentifiant || 'Identifiant']: c.identifiantSpecifique || '---',
      'Date de Naissance': c.dateNais ? new Date(c.dateNais).toLocaleDateString() : '---'
      //'Statut': 'Inactif'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidats Inactifs');

    XLSX.writeFile(workbook, `Candidats_Inactifs_${new Date().toLocaleDateString()}.xlsx`);
  }


  onImportExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Conversion du fichier en JSON (Tableau d'objets)
      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet);
      this.synchronizeCandidats(excelData);
    };
    reader.readAsArrayBuffer(file);
  }

  /* private synchronizeCandidats(excelData: any[]) {
     this.loading = true;
     this.errorMessage = '';
     this.successMessage = 'Synchronisation en cours...';

     const excelEmails = excelData.map(row =>
       (row.username || row.Email || row.email || '').toLowerCase().trim()
     ).filter(email => email !== '');

     const toDelete = this.allCandidats.filter(c =>
       !excelEmails.includes(c.username?.toLowerCase().trim())
     );

     excelData.forEach(row => {
       const email = (row.username || row.Email || row.email || '').toLowerCase().trim();
       if (!email) return;

       const existingCandidat = this.allCandidats.find(c =>
         c.username?.toLowerCase().trim() === email
       );

       let rawDate = row.dateNais || row['Date Naissance'] || row['Date de Naissance'];
       let finalDateForBackend = null;

       if (rawDate) {
           if (rawDate instanceof Date) {
               // Cas : Objet Date pur
               finalDateForBackend = rawDate.toISOString().substring(0, 10);
           } else if (typeof rawDate === 'number') {
               // Cas : Nombre Excel (ex: 38018)
               const date = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
               finalDateForBackend = date.toISOString().substring(0, 10);
           } else if (typeof rawDate === 'string') {
               // Cas : String "01/01/1990" -> "1990-01-01"
               if (rawDate.includes('/')) {
                   const parts = rawDate.split('/');
                   finalDateForBackend = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
               } else {
                   finalDateForBackend = rawDate.substring(0, 10);
               }
           }
       }

       // --- CONSTRUCTION DU PAYLOAD ---
       const payload: any = {
         nom: row.nom || row.Nom || '',
         prenom: row.prenom || row.Prénom || '',
         username: email,
         dateNais: finalDateForBackend,
         identifiantSpecifique: String(row.identifiantSpecifique || row.Identifiant || row[this.tenantConfig?.labelIdentifiant] || ''),
         specialiteId: row.specialiteId || (existingCandidat ? existingCandidat.specialite?.idSpecialite : this.specialites[0]?.idSpecialite),
         statut: true // Forcé à true pour l'UI
       };

       if (existingCandidat) {
         // --- CAS MISE À JOUR ---
         // On garde le nombre d'épreuves actuel ou on met 0 si absent
         payload.nbreEpreuve = existingCandidat.nbreEpreuve !== undefined ? existingCandidat.nbreEpreuve : 0;

         // On n'envoie PAS de mot de passe pour ne pas le changer
         this.adminService.updateCandidat(existingCandidat.id, payload).subscribe({
           next: () => console.log(`MAJ réussie pour ${email}`),
           error: (err) => console.error(`Erreur MAJ ${email}`, err)
         });
       } else {
         // --- CAS NOUVEAU ---
         payload.password = "Password123!"; // Mot de passe par défaut seulement ici
         payload.nbreEpreuve = 0; // Nouveau candidat = 0 épreuves

         this.adminService.createCandidat(payload).subscribe({
           next: () => console.log(`Création réussie pour ${email}`),
           error: (err) => console.error(`Erreur création ${email}`, err)
         });
       }
     });

     // Suppression des absents
     toDelete.forEach(c => this.adminService.deleteCandidat(c.id).subscribe());

     setTimeout(() => {
       this.loadCandidatsParSpecialite();
       this.loading = false;
       this.cdr.detectChanges();
     }, 3500);
   }*/

  private synchronizeCandidats(excelData: any[]) {
    this.errorMessage = '';
    this.successMessage = '';
    const errors: string[] = [];
    const validatedData: any[] = [];

    // 1. PRE-VALIDATION DES DONNÉES
    excelData.forEach((row, index) => {
      const lineNum = index + 2; // +2 car Excel commence à 1 et la ligne 1 est l'en-tête
      const email = (row.username || row.Email || row.email || '').toLowerCase().trim();

      if (!email) {
        errors.push(`Ligne ${lineNum}: Email manquant.`);
        return;
      }

      // --- A. CONTRÔLE DE LA SPÉCIALITÉ ---
      // On cherche si le nom de la spécialité dans l'Excel existe dans notre liste 'specialites'
      const specialiteNom = row.specialite || row.Specialite || row['Spécialité'];
      const foundSpec = this.specialites.find(s =>
        s.nom.toLowerCase().trim() === (specialiteNom || '').toString().toLowerCase().trim()
      );

      if (!foundSpec) {
        errors.push(`Ligne ${lineNum}: La spécialité "${specialiteNom}" n'existe pas dans cet établissement.`);
      }

      // --- B. CONTRÔLE DE L'IDENTIFIANT ---
      const idValue = String(row.identifiantSpecifique || row.Identifiant || row[this.tenantConfig?.labelIdentifiant] || '').trim();
      const config = this.tenantConfig;

      if (config && config.typeIdentifiant !== 'EMAIL') {
        // Vérification de la longueur
        if (idValue.length !== config.longueurIdentifiant) {
          errors.push(`Ligne ${lineNum}: L'identifiant "${idValue}" doit avoir exactement ${config.longueurIdentifiant} caractères.`);
        }

        // Vérification du format
        const isNumeric = /^\d+$/.test(idValue);
        const isAlpha = /^[a-zA-Z]+$/.test(idValue);
        const hasAlpha = /[a-zA-Z]/.test(idValue);
        const hasNumeric = /\d/.test(idValue);

        if (config.formatIdentifiant === 'NUMERIC' && !isNumeric) {
          errors.push(`Ligne ${lineNum}: L'identifiant doit contenir uniquement des chiffres.`);
        } else if (config.formatIdentifiant === 'ALPHA' && !isAlpha) {
          errors.push(`Ligne ${lineNum}: L'identifiant doit contenir uniquement des lettres.`);
        } else if (config.formatIdentifiant === 'ALPHANUMERIC') {
          if (!hasAlpha || !hasNumeric) {
            errors.push(`Ligne ${lineNum}: L'identifiant doit être alphanumérique (au moins une lettre et un chiffre).`);
          }
        }
      }

      // Si pas d'erreur sur cette ligne, on prépare le payload
      if (errors.length === 0) {
        validatedData.push({ ...row, validatedSpecId: foundSpec?.idSpecialite, validatedEmail: email, validatedIdSpec: idValue });
      }
    });

    // 2. AFFICHAGE DES ERREURS OU EXÉCUTION
    if (errors.length > 0) {
      // On affiche les 5 premières erreurs pour ne pas inonder l'écran
      const displayErrors = errors.slice(0, 5);
      this.errorMessage = `Import refusé (${errors.length} erreurs) : \n` + displayErrors.join('\n') + (errors.length > 5 ? '\n...' : '');
      this.loading = false;
      this.cdr.detectChanges();
      return; // STOP ICI
    }

    // 3. SI TOUT EST OK : SYNCHRONISATION
    this.loading = true;
    this.successMessage = "Validation réussie. Synchronisation...";

    const excelEmails = validatedData.map(d => d.validatedEmail);
    const toDelete = this.allCandidats.filter(c => !excelEmails.includes(c.username?.toLowerCase().trim()));

    validatedData.forEach(data => {
      const existingCandidat = this.allCandidats.find(c => c.username?.toLowerCase().trim() === data.validatedEmail);

      // Formatage de la date (Ta logique substring(0,10))
      let rawDate = data.dateNais || data['Date Naissance'];
      let formattedDate = '';
      if (rawDate) {
         const d = (rawDate instanceof Date) ? rawDate : new Date(rawDate);
         if (!isNaN(d.getTime())) formattedDate = d.toISOString().substring(0, 10);
      }

      const payload = {
        nom: data.nom || data.Nom,
        prenom: data.prenom || data.Prénom,
        username: data.validatedEmail,
        dateNais: formattedDate,
        identifiantSpecifique: data.validatedIdSpec,
        specialiteId: data.validatedSpecId,
        statut: true,
        nbreEpreuve: existingCandidat ? (existingCandidat.nbreEpreuve || 0) : 0
      };

      if (existingCandidat) {
        this.adminService.updateCandidat(existingCandidat.id, payload).subscribe();
      } else {
        this.adminService.createCandidat({ ...payload, password: 'Password123!' }).subscribe();
      }
    });

    // Suppression des absents
    toDelete.forEach(c => this.adminService.deleteCandidat(c.id).subscribe());

    setTimeout(() => {
      this.loadCandidatsParSpecialite();
      this.successMessage = "Importation réussie !";
      this.loading = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
