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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
  RouterModule,BaseChartDirective,
    FormsModule
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

  searchText: string = '';
  showResults: boolean = false;
  filteredResults: any[] = [];


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
    this.loadDashboardData();
    this.years = [];
        const currentYear = new Date().getFullYear();
        console.log(currentYear);
        for (let year = currentYear + 2; year >= 2026; year--) {
            this.years.push(year);
        }
    this.loadLowPerfStats();
    this.loadTopFlopStats();

  }

onYearChange(): void {
  this.loadTopFlopStats();
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


            gradient.addColorStop(0, '#303D49');
            gradient.addColorStop(0.5, '#ea5357');
            gradient.addColorStop(1, '#ff7675');



            return gradient;
          },
          hoverBackgroundColor: '#ea5357'
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


  searchDatabase = [
    {
      name: 'Dashboard',
      link: '/super-admin',
      icon: 'fas fa-th-large',
      type: 'Page',
      keywords: ['dashboard', 'accueil','statistique']
    },
    {
      name: 'Tenants',
      link: '/super-admin/tenants',
      icon: 'fas fa-layer-group',
      type: 'Gestion',
      keywords: ['tenant', 'entreprise', 'organisation']
    },
    {
      name: 'Admins Tenants',
      link: '/super-admin/adminTenants',
      icon: 'fas fa-user-shield',
      type: 'Gestion',
      keywords: ['admin', 'tenant admin', 'adminTenant']
    },
    {
      name: 'Catégories',
      link: '/super-admin/categories',
      icon: 'fas fa-tags',
      type: 'Catalogue',
      keywords: ['categorie','catégorie module']
    },
    {
      name: 'Modules',
      link: '/super-admin/modules',
      icon: 'fas fa-cubes',
      type: 'Catalogue',
      keywords: ['module', 'formation' , 'question comportementale','question technique','questions réponse' ]
    },
    {
      name: 'Paramètres',
      link: '/super-admin/parametre',
      icon: 'fas fa-cog',
      type: 'Config',
      keywords: ['parametre', 'settings']
    }
  ];


  onSearch() {
    const search = this.searchText.toLowerCase().trim();

    if (search.length > 1) {
      this.showResults = true;

      this.filteredResults = this.searchDatabase.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.keywords.some(k => k.includes(search))
      );
    } else {
      this.showResults = false;
      this.filteredResults = [];
    }
  }

  goTo(link: string) {
    this.router.navigate([link]);
    this.searchText = '';
    this.showResults = false;
  }

selectedYear: number = new Date().getFullYear();
years: number[] = [];
successChartData: ChartData<'bar'> = {
  labels: [],
  datasets: []
};


public successChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',

  layout: {
    padding: {
      top: 10,
      right: 20,
      bottom: 10,
      left: 10
    }
  },

  animation: {
    duration: 1400,
    easing: 'easeOutQuart'
  },

  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.96)',
      titleColor: '#ffffff',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      padding: 14,
      cornerRadius: 16,
      displayColors: true,

      callbacks: {
        label: (ctx) => ` ${ctx.parsed.x}% de réussite`
      }
    }
  },

  scales: {
    x: {
      min: 0,
      max: 100,

      grid: {
        color: 'rgba(148, 163, 184, 0.12)',
      },

      border: {
        display: false
      },

      ticks: {
        color: '#94a3b8',

        font: {
          size: 12,
          weight: 600
        },

        callback: (value) => value + '%'
      }
    },

    y: {
      grid: {
        display: false,
      },

      border: {
        display: false
      },

      ticks: {
        color: '#334155',

        font: {
          size: 13,
          weight: 700
        }
      }
    }
  }
};

loadTopFlopStats(): void {
  this.superAdminService.getTopFlopSuccessRate(this.selectedYear).subscribe({
    next: (data) => {

      const combined = [...data.top, ...data.flop];

      const uniqueModules = Array.from(
        new Map(combined.map(m => [m.nomModule, m])).values()
      );

      uniqueModules.sort((a, b) => b.taux - a.taux);

      this.successChartData = {
        labels: uniqueModules.map(m => m.nomModule),

        datasets: [
          {
            label: 'Taux de Réussite (%)',

            data: uniqueModules.map(m => m.taux),

            backgroundColor: uniqueModules.map(m => {


              if (m.taux >= 80) {
                return 'rgba(234, 83, 87, 0.92)';
              }

              if (m.taux >= 60) {
                return 'rgba(255, 118, 117, 0.90)';
              }

              if (m.taux >= 40) {
                return 'rgba(48, 61, 73, 0.88)';
              }

              return 'rgba(120, 53, 15, 0.88)';
            }),

            hoverBackgroundColor: uniqueModules.map(m => {


              if (m.taux >= 80) {
                return '#d94347';
              }

              if (m.taux >= 60) {
                return '#ea5357';
              }

              if (m.taux >= 40) {
                return '#303D49';
              }

              return '#78350f';
            }),

            borderRadius: 14,
            borderSkipped: false,

            borderWidth: 1.5,

            borderColor: uniqueModules.map(m => {


              if (m.taux >= 80) {
                return '#ea5357';
              }

              if (m.taux >= 60) {
                return '#ff7675';
              }

              if (m.taux >= 40) {
                return '#303D49';
              }

              return '#78350f';
            }),

            hoverBorderWidth: 2,

            barThickness: 28,
            maxBarThickness: 32,

            categoryPercentage: 0.72,
            barPercentage: 0.82
          }
        ]
      };

      this.cdr.detectChanges();
    },

    error: (err) => {
      console.error('Erreur stats Top/Flop', err);
    }
  });
}

isSidebarVisible = false;

      toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
      }
}
