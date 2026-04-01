import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';


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


  stats: DashboardStats = {
    etablissements: 0,
    directeurs: 0
  };

  currentUser: any;
  loading = true;

  constructor(
      private service: AdminTenantService,
      private cdr: ChangeDetectorRef
    ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.service.getStats().subscribe({
     next: (res) => {
       console.log("Data reçue du serveur :", res);
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


  updateLocalStats(etablissementsList: any[], directeursList: any[]) {
    this.stats.etablissements = etablissementsList.length;
    this.stats.directeurs = directeursList.length;

  }
}
