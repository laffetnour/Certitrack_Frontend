import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DirecteurService } from '../../../../core/services/directeur.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { ConfigService } from '../../../../core/services/config.service';
import { AdminService, StatData } from '../../../../core/services/admin.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';
Chart.register(...registerables);
import { filter } from 'rxjs/operators';


interface DashboardStats {
  etablissement: string;
  admins: number;
  candidats: number;
  specialites: number;
}

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  stats: DashboardStats = {
    etablissement: '',
    admins: 0,
    candidats: 0,
    specialites: 0
  };

  currentUser: any;
  loading = true;
   totalCandidats: number = 0;

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
     private adminService: AdminService,
       private service: DirecteurService,
       private cdr: ChangeDetectorRef,
       public configService: ConfigService
     ) {}

   ngOnInit() {
     this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
     this.loadDashboardData();
     this.loadChartsData();
   }

  loadDashboardData(): void {
    this.loading = true;

    this.service.getStats().subscribe({
      next: (res) => {
        console.log("📊 Data reçue du serveur :", res);


        this.stats = {
          etablissement: res.etablissement || 'Établissement inconnu',
          admins: res.admins || 0,
          candidats: res.candidats || 0,
          specialites: res.specialites || 0
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


loadChartsData(): void {
  const idEtab = this.currentUser?.etablissements?.[0]?.id || this.currentUser?.etablissements?.[0]?.idEtab;


  console.log("etab: ",idEtab);
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

    this.cdr.detectChanges();
  },
  error: (err) => console.error("Erreur lors de la récupération des stats", err)
});
}

  updateLocalStats(adminsList: any[], candidatsList: any[], specsList: any[]): void {
    this.stats.admins = adminsList.length;
    this.stats.candidats = candidatsList.length;
    this.stats.specialites = specsList.length;
    this.cdr.detectChanges();
  }

}
