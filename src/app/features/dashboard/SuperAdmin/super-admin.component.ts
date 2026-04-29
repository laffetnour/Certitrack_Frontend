import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import {ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { ConfigService } from '../../../core/services/config.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
  RouterModule,BaseChartDirective
  ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  templateUrl: './superAdmin.component.html',
  styleUrls: ['./superAdmin.component.css']
})
export class SuperAdminComponent implements OnInit {
  currentUser: any;
  adminsList: any[] = [];
  stats: any = { tenants: 0, etablissements: 0, admins: 0 };
  isLoading: boolean = false;

  isCatalogueOpen: boolean = false;
  isParcoursOpen: boolean = false;
  isQuestionOpen: boolean = false;

  lowPerfModules: any[] = [];

    /*public barChartOptions: ChartConfiguration['options'] = {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Modules à faible taux d\'inscription' }
      }
    };*/

  public barChartOptions: ChartConfiguration['options'] = {
       responsive: true,
       maintainAspectRatio: false,

       layout: {
         padding: {
           top: 20
         }
       },

       animation: {
         duration: 1200,
         easing: 'easeOutQuart'
       },

       interaction: {
         mode: 'index',
         intersect: false
       },

       plugins: {
         legend: { display: false },

         tooltip: {
           backgroundColor: '#111827',
           titleColor: '#fff',
           bodyColor: '#d1d5db',
           padding: 12,
           cornerRadius: 10,
           displayColors: false,
           callbacks: {
             label: (ctx) => ` ${ctx.parsed.y} inscriptions`
           }
         }
       },

       scales: {
         x: {
           grid: { display: false },
           border: { display: false },
           ticks: {
             color: '#9ca3af',
             font: {
               family: 'Inter, sans-serif',
               size: 12,
               weight: 200
             }
           }
         },

         y: {
           beginAtZero: true,
           border: { display: false },
           grid: {
             color: 'rgba(0,0,0,0.05)'
           },
         title: {
                 display: true,
                 text: 'Nombre des inscriptions',
                 color: '#9ca3af',
                 },
           ticks: {
             color: '#9ca3af'
           }
         }
       }
     };

    public barChartType: ChartType = 'bar';
    public barChartData: ChartData<'bar'> = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Nombre d\'inscrits',
          backgroundColor: '#ff7675',
          borderColor: '#d63031',
          borderWidth: 1
        }
      ]
    };


  constructor(
    public router: Router,
    private superAdminService: SuperAdminService,
    private authService: AuthService,
  private cdr: ChangeDetectorRef,
  public configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadDashboardData();
    this.loadLowPerfStats();
  }

loadLowPerfStats(): void {
  this.superAdminService.getBottomModules().subscribe({
    next: (data) => {
      console.log('Données Low Perf:', data);
      this.lowPerfModules = data;

      this.barChartData = {
        labels: data.map(m => m.nom),
        datasets: [{
          label: 'Nombre d\'inscrits (Alerte)',
          data: data.map(m => m.nombreInscrits),
          borderRadius: 16,
          barThickness: 40,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              return '#1E293B';
            }

            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

            gradient.addColorStop(0, '#1E293B');
            gradient.addColorStop(0.5, '#22D3EE');
            gradient.addColorStop(1, '#22D3EE');

            return gradient;
          },
          hoverBackgroundColor: '#22D3EE'
        }]
      };

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Erreur lors de la récupération des modules peu performants", err);
    }
  });
}
toggleCatalogue(): void {
    this.isCatalogueOpen = !this.isCatalogueOpen;
     if (this.isCatalogueOpen) this.isQuestionOpen = false;
  }

  toggleParcours(): void {
    this.isParcoursOpen = !this.isParcoursOpen;
  }
  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      stats: this.superAdminService.getDashboardStats(),
      admins: this.superAdminService.getAllAdmins()
    }).subscribe({
      next: (result) => {
        console.log("Données reçues :", result);


        this.stats = result.stats;
        this.adminsList = result.admins;

        this.isLoading = false;


        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  toggleStatus(id: number): void {
    this.superAdminService.toggleAdminStatus(id).subscribe({
      next: () => this.loadDashboardData(),
      error: () => alert("Erreur lors de la modification du statut")
    });
  }

  deleteAdmin(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet administrateur ?')) {
      this.superAdminService.deleteAdmin(id).subscribe({
        next: () => {

          this.loadDashboardData();
        },
        error: (err) => console.error("Erreur suppression:", err)
      });
    }
  }



  toggleQuestionMenu() {
    this.isQuestionOpen = !this.isQuestionOpen;

    if (this.isQuestionOpen) this.isCatalogueOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
  }


}
