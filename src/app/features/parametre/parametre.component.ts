import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService, Configuration } from '../../core/services/config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parametre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametre.component.html',
  styleUrls: ['./parametre.component.css']
})
export class ParametreComponent implements OnInit {
  activeSection: string = 'profil';
  currentUser: any;
  globalConfig: Configuration | null = null;

  // États de chargement
  isSavingConfig: boolean = false;
  isUploadingPhoto: boolean = false;
  isSavingUser: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.currentUser = JSON.parse(JSON.stringify(user));
    const savedTheme = localStorage.getItem('app-theme') || this.currentUser?.theme || 'light';
    this.applyTheme(savedTheme);
    if (!this.currentUser.contacts || this.currentUser.contacts.length === 0) {
      this.currentUser.contacts = [{
        type: {
          emailPersonnel: '',
          numTel: ''
        }
      }];
    }

    this.loadUserConfiguration();
  }


  updateFullProfile(): void {
    this.isSavingUser = true;
    this.authService.updateUserOnServer(this.currentUser).subscribe({
      next: (updatedUser) => {
        this.authService.saveUser(updatedUser);
        window.dispatchEvent(new Event('userUpdated'));
        this.isSavingUser = false;
        alert("✅ Profil mis à jour !");
      },
      error: (err) => {
        this.isSavingUser = false;
        console.error(err);
        alert("❌ Erreur lors de la mise à jour");
      }
    });
  }

get contactInfo() {
  if (this.currentUser && this.currentUser.contacts && this.currentUser.contacts[0]) {
    return this.currentUser.contacts[0].type;
  }
  return { emailPersonnel: '', numTel: '' };
}


  onPhotoProfilChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("L'image est trop lourde (max 500 Ko)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.isUploadingPhoto = true;
      const base64Image = reader.result as string;
      this.currentUser.photo = base64Image;

      this.authService.updateUserOnServer(this.currentUser).subscribe({
        next: () => {
          this.authService.saveUser(this.currentUser);
          window.dispatchEvent(new Event('userUpdated'));
          this.isUploadingPhoto = false;
          this.cdr.detectChanges();
        },
        error: () => this.isUploadingPhoto = false
      });
    };
    reader.readAsDataURL(file);
  }

  // --- GESTION DE LA CONFIGURATION (Thème & Admin) ---

  private loadUserConfiguration(): void {
      const userId = this.currentUser?.idUtilisateur || this.currentUser?.id;
      if (!userId) return;

      this.configService.getConfigByUserId(userId).subscribe({
        next: (conf) => {
          this.globalConfig = { ...conf };
         if (conf.nomPlateforme) {
                 document.title = conf.nomPlateforme;
              }

             this.currentUser.theme = conf.theme;
             this.applyTheme(conf.theme);


          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur de chargement de la config", err);
          // Fallback avec la nouvelle structure user_id
          this.globalConfig = {
            nomPlateforme: 'CertiTrack',
            theme: 'light',
            logoSociete: '',
            user_id: userId // Corrigé ici
          };
        }
      });
    }

  onLogoSocieteChange(event: any): void {
    const file = event.target.files[0];
    if (file && this.globalConfig) {
      const reader = new FileReader();
      reader.onload = () => {
        this.globalConfig!.logoSociete = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

changePersonalTheme(theme: string): void {
  if (!this.globalConfig) return;

  // 1. On met à jour l'objet local immédiatement
  this.globalConfig.theme = theme;
  this.currentUser.theme = theme;

  // 2. On applique visuellement (CSS)
  this.applyTheme(theme);
  localStorage.setItem('app-theme', theme);
    this.authService.saveUser(this.currentUser);
  this.cdr.detectChanges();


  // 4. Sauvegarde automatique du thème
  const userId = this.currentUser.idUtilisateur || this.currentUser.id;
  const payload: Configuration = {
    id: this.globalConfig.id,
    nomPlateforme: this.globalConfig.nomPlateforme,
    theme: theme, // On force la nouvelle valeur ici
    logoSociete: this.globalConfig.logoSociete,
    user_id: userId
  };

  this.configService.updateConfig(payload).subscribe({
    next: (savedConf) => {
      this.globalConfig = savedConf;
      console.log("✅ Thème mis à jour en BDD dans Configuration");
      this.cdr.detectChanges();
    },
    error: (err) => console.error("❌ Erreur sauvegarde thème", err)
  });
}

saveGlobalSettings(): void {
  if (!this.globalConfig || !this.currentUser) return;

  this.isSavingConfig = true;
  this.cdr.detectChanges();
  const userId = this.currentUser.idUtilisateur || this.currentUser.id;

  // On construit le payload final
  const payload: Configuration = {
    id: this.globalConfig.id,
    nomPlateforme: this.globalConfig.nomPlateforme,
    theme: this.globalConfig.theme, // Le thème actuel de l'objet
    logoSociete: this.globalConfig.logoSociete,
    user_id: userId
  };

  this.configService.updateConfig(payload).subscribe({
    next: (res) => {
      this.isSavingConfig = false;
      this.globalConfig = res;

      alert("✅ Configuration (Logo & Thème) sauvegardée !");
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.isSavingConfig = false;
      this.cdr.detectChanges();
      console.error("Erreur serveur:", err);
    }
  });
}
// config.service.ts
applyTheme(theme: string) {
  const htmlElement = document.documentElement; // Cible la balise <html>
  if (theme === 'dark') {
    htmlElement.classList.add('dark-mode');
  } else {
    htmlElement.classList.remove('dark-mode');
  }
}
}
