
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, StatData } from '../../../core/services/admin.service';
import { ConfigService } from '../../../core/services/config.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { FormsModule } from '@angular/forms';
Chart.register(...registerables);

const barShadowPlugin = {
  id: 'barShadow',
  beforeDatasetDraw(chart: any) {
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = 'rgba(79, 70, 229, 0.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
  },
  afterDatasetDraw(chart: any) {
    chart.ctx.restore();
  }
};

Chart.register(barShadowPlugin);

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule, BaseChartDirective],
  templateUrl: './homeAdmin.component.html',
  styleUrls: ['./admin.component.css']
})
export class homeAdminComponent implements OnInit {
  currentUser: any;
  isParcoursOpen = false;
  totalCandidats: number = 0;
  loading: boolean = false;
  tenantLogo: string | null = null;
 public barChartType: ChartType = 'bar';


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
           label: (ctx) => ` ${ctx.parsed.y} candidats`
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
               text: 'Nombre de candidats',
               color: '#9ca3af',
               },
         ticks: {
           stepSize: 1,
           precision: 0,
           color: '#9ca3af'
         }
       }
     }
   };
  public modulesChartData: ChartData<'bar'> = {
     labels: [],
     datasets: [{ data: [], label: 'Inscriptions par Module', backgroundColor: '#ea5357' }]
   };

public specialiteChartData: ChartConfiguration<'doughnut'>['data'] = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: ['#22D3EE','#6B7280','#E5E7EB','#1E293B','#EA5357','#F3F4F6'],
    hoverOffset: 15,
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
};


public specialiteChartOptions: ChartConfiguration<'doughnut'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '0%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, font: { weight: 100 } }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
          const value = context.raw as number;
          const percentage = ((value / total) * 100).toFixed(1);
          return ` ${context.label}: ${value} candidats (${percentage}%)`;
        }
      }
    }
  }
};

  constructor(
    private authService: AuthService,
    public router: Router,
    private adminService: AdminService,
  private cdr: ChangeDetectorRef,
    public configService: ConfigService
  ) {}



  ngOnInit(): void {

    this.currentUser = this.authService.getUser();


    if (this.currentUser) {
      this.tenantLogo = this.currentUser?.tenantLogo;

      this.loadStats();
      this.loadChartsData();
    } else {
      console.warn("Pas d'utilisateur trouvé au refresh, redirection login...");
      this.router.navigate(['/login']);
    }
  }
  loadStats(): void {
    const etablissement = this.currentUser?.etablissement;



    const idToUse = etablissement?.idEtab || etablissement?.id;

    if (idToUse) {
      this.loading = true;
      this.adminService.getCandidatCountByEtab(idToUse).subscribe({
        next: (count: number) => {
          this.totalCandidats = count;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur lors de l'appel API stats :", err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleParcoursMenu(): void {
    this.isParcoursOpen = !this.isParcoursOpen;
  }

  onLogout(): void {
    this.authService.logout();
  }

loadChartsData(): void {
  const idEtab =
    this.currentUser?.etablissement?.idEtab;

  console.log(idEtab);
  if (!idEtab) return;


  this.adminService.getStatsModules(idEtab).subscribe({
    next: (data: StatData[]) => {
      console.log(data);
      this.modulesChartData = {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.value),
          label: 'Inscriptions par Module',
          borderRadius: 16,
           barThickness: 40,



                     backgroundColor: (context) => {
                       const { ctx, chartArea } = context.chart;
                       if (!chartArea) return '#6366f1';

                       const gradient = ctx.createLinearGradient(
                         0,
                         chartArea.bottom,
                         0,
                         chartArea.top
                       );

                      gradient.addColorStop(1, '#22D3EE');
                       gradient.addColorStop(0, '#1E293B');
                       gradient.addColorStop(0.5, '#22D3EE');


                       return gradient;
                     },

                     hoverBackgroundColor: '#22D3EE'

                 }
                        ]
      };
      this.modulesChartData.datasets[0].data =
                    data.map(item => item.value);
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Erreur stats modules", err)
  });


this.adminService.getStatsSpecialites(idEtab).subscribe({
  next: (data: StatData[]) => {
    this.specialiteChartData = {
      labels: data.map(item => item.label),
      datasets: [
        {
          data: data.map(item => item.value),
          label: 'Candidats par spécialités',

          backgroundColor: [
            '#22D3EE',
            '#6B7280',
            '#E5E7EB',
            '#1E293B',
            '#EA5357',
            '#F3F4F6'

          ],

          hoverOffset: 15,
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    // Indispensable pour rafraîchir la vue après l'appel API
    this.cdr.detectChanges();
  },
  error: (err) => console.error("Erreur lors de la récupération des stats", err)
});
}

searchText: string = '';
  showResults: boolean = false;

  searchDatabase = [
    { name: 'Dashboard', link: '/admin', type: 'page', icon: 'fas fa-home',
      keywords: ['dashboard', 'accueil','statistique', 'stat'] },
    { name: 'Liste des Candidats', link: '/admin/candidats', type: 'page',
      icon: 'fas fa-user-graduate',keywords: ['candidats','creer','statut','valider'] },
    { name: 'Sessions d\'Examen', link: '/admin/sessionsExamen', type: 'page',
      icon: 'fas fa-chart-bar',keywords: ['examen','date','certification','centre'] },
    { name: 'Import GMetrix', link: '/admin/import-gmetrix', type: 'page',
      icon: 'fas fa-file-import',keywords: ['resultats','score','gmetrix','import'] },
    { name: 'Paramètres système', link: '/admin/parametre', type: 'page',
      icon: 'fas fa-cog',keywords: ['parametre', 'settings', 'profil'] },
    { name: 'Résultats Sessions Inscriptions', link: '/admin/resultats-sessions',
      type: 'page', icon: 'fas fa-chart-bar',keywords: ['resultats','inscriptions','modules','test','score','durée'] },
  ];

  filteredResults: any[] = [];

      onSearch() {
        const search = this.searchText.toLowerCase().trim();

        if (search.length > 1) {
          this.showResults = true;

          this.filteredResults = this.searchDatabase
            .map(item => {
              const matchedKeyword = item.keywords.find(k =>
                k.toLowerCase().includes(search)
              );

              const matchName = item.name.toLowerCase().includes(search);

              if (matchName || matchedKeyword) {
                return {
                  ...item,
                  matchedKeyword: matchedKeyword || null
                };
              }

              return null;
            })
            .filter(Boolean);

        } else {
          this.showResults = false;
          this.filteredResults = [];
        }
      }

      selectResult(link: string) {
        window.location.href = link;
        this.searchText = '';
        this.showResults = false;
      }

  /*filteredResults: any[] = [];

  onSearch() {
    const search = this.searchText.toLowerCase().trim();
    if (search.length > 1) {
      this.showResults = true;
      this.filteredResults = this.searchDatabase.filter(item =>
        item.name.toLowerCase().includes(search)
      );
    } else {
      this.showResults = false;
    }
  }

  selectResult(link: string) {
    this.router.navigate([link]);
    this.searchText = '';
    this.showResults = false;
  }*/
}
