import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';

// L'interface se définit à l'extérieur de la classe
interface DashboardStats {
  etablissements: number;
  directeurs: number;

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardTenantComponent implements OnInit {

  // Initialisation avec des valeurs par défaut
  stats: DashboardStats = {
    etablissements: 0,
    directeurs: 0
  };

  currentUser: any;
  loading = true;

  constructor(
      private service: AdminTenantService,
      private cdr: ChangeDetectorRef // Importez ChangeDetectorRef depuis @angular/core
    ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.service.getStats().subscribe({
     next: (res) => {
       console.log("Data reçue du serveur :", res); // <--- AJOUTEZ CECI
       this.stats = {
         etablissements: res.etablissements || 0,
         directeurs: res.directeurs || 0
       };
       this.loading = false;
       this.cdr.detectChanges();
     },
      error: (err) => {
        console.error("Erreur stats:", err);
        this.loading = false;
      }
    });
  }

  // Si vous voulez recalculer les stats localement (ex: après un filtre côté front)
  updateLocalStats(etablissementsList: any[], directeursList: any[]) {
    this.stats.etablissements = etablissementsList.length;
    this.stats.directeurs = directeursList.length;

  }
}
