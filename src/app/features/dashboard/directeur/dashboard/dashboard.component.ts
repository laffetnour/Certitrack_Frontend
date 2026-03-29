import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DirecteurService } from '../../../../core/services/directeur.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

// Interface définie à l'extérieur pour la clarté
interface DashboardStats {
  etablissement: string;
  admins: number;
  candidats: number;
  specialites: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Initialisation avec des valeurs par défaut (Évite les erreurs de template)
  stats: DashboardStats = {
    etablissement: '',
    admins: 0,
    candidats: 0,
    specialites: 0
  };

  currentUser: any;
  loading = true;

  constructor(
       private service: DirecteurService,
       private cdr: ChangeDetectorRef // Importez ChangeDetectorRef depuis @angular/core
     ) {}

   ngOnInit() {
     this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
     this.loadDashboardData();
   }
  /**
   * Charge les statistiques depuis le backend
   */
  loadDashboardData(): void {
    this.loading = true;

    this.service.getStats().subscribe({
      next: (res) => {
        console.log("📊 Data reçue du serveur :", res);

        // Mapping sécurisé identique au principe du Tenant
        this.stats = {
          etablissement: res.etablissement || 'Établissement inconnu',
          admins: res.admins || 0,
          candidats: res.candidats || 0,
          specialites: res.specialites || 0
        };

        this.loading = false;
        this.cdr.detectChanges(); // Force le rendu pour éviter les délais
      },
      error: (err) => {
        console.error("Erreur stats:", err);
        this.loading = false;
      }
    });
  }

  /**
   * Mise à jour locale (Utile après une action CRUD sans rechargement API)
   */
  updateLocalStats(adminsList: any[], candidatsList: any[], specsList: any[]): void {
    this.stats.admins = adminsList.length;
    this.stats.candidats = candidatsList.length;
    this.stats.specialites = specsList.length;
    this.cdr.detectChanges();
  }
}
