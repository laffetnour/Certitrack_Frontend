
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService, StatData } from '../../../core/services/admin.service';
import { ConfigService } from '../../../core/services/config.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';

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

// ✅ Enregistrement ICI aussi
Chart.register(barShadowPlugin);

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule,RouterModule, BaseChartDirective],
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
             weight: 500
           }
         }
       },

       y: {
         beginAtZero: true,
         border: { display: false },
         grid: {
           color: 'rgba(0,0,0,0.05)'
         },
         ticks: {
           color: '#9ca3af'
         }
       }
     }
   };
  /* public modulesChartData: ChartData<'bar'> = {
     labels: [],
     datasets: [{ data: [], label: 'Inscriptions par Module', backgroundColor: '#ea5357' }]
   };*/

   public specialiteChartData: ChartData<'bar'> = {
     labels: [],
    // datasets: [{ data: [], label: 'Inscriptions par Spécialité', backgroundColor: '#303D49' }]
    datasets: [{
      data: [],
      label: 'Candidats',

       borderRadius: 12,
            barThickness: 28,

            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;

              if (!chartArea) return;

              const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

              gradient.addColorStop(0, '#6366f1'); // bas
              gradient.addColorStop(1, '#8b5cf6'); // haut

              return gradient;
            },

            hoverBackgroundColor: '#4f46e5'
          }
        ]
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
    const etablissement = this.currentUser?.etablissements?.[0];



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
  const idEtab = this.currentUser?.etablissements?.[0]?.id || this.currentUser?.etablissements?.[0]?.idEtab;

  console.log(idEtab);
  if (!idEtab) return;

 /*
  this.adminService.getStatsModules(idEtab).subscribe({
    next: (data: StatData[]) => {
      this.modulesChartData = {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.value),
          label: 'Inscriptions par Module',
          backgroundColor: '#ea5357',
          hoverBackgroundColor: '#303D49',
          borderRadius: 8
        }]
      };
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Erreur stats modules", err)
  });*/

 this.adminService.getStatsSpecialites(idEtab).subscribe({
   next: (data: StatData[]) => {



     this.specialiteChartData = {
       labels: data.map(item => item.label),
       datasets: [
         {
           data: data.map(item => item.value),
           label: 'Candidats par spécialités',

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

             gradient.addColorStop(0, '#4f46e5');
             gradient.addColorStop(0.5, '#6366f1');
             gradient.addColorStop(1, '#a78bfa');

             return gradient;
           },

           hoverBackgroundColor: '#4338ca'
         }
       ]
     };
    this.specialiteChartData.datasets[0].data =
              data.map(item => item.value);
     this.cdr.detectChanges();
   },
   error: (err) => console.error("Erreur stats spécialités", err)
 });

}
}
