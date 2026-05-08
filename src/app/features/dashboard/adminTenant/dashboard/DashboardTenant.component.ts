import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';
import { ConfigService } from '../../../../core/services/config.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';

interface DashboardStats {
  etablissements: number;
  directeurs: number;

}

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective], // 👈 AJOUT ICI
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardTenantComponent implements OnInit {
  idTenant: string | null = null;

  stats: DashboardStats = {
    etablissements: 0,
    directeurs: 0
  };

  currentUser: any;
  loading = true;



  public barChartType: ChartType = 'bar';

  public modulesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Modules les moins utilisés'
      }
    ]
  };

  /*public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };*/

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: '#64748b',
          font: {
            size: 12
          }
        }
      },

      tooltip: {
        backgroundColor: '#303D49',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 10,
        displayColors: false
      }
    },

    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(234, 83, 87, 0.08)'  // glow rouge léger
        },
        ticks: { color: '#64748b' }
      }
    }
  };


  constructor(
      private service: AdminTenantService,
      private cdr: ChangeDetectorRef,
      public configService: ConfigService,
      private route: ActivatedRoute
    ) {}

  /*ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadDashboardData();
    this.loadModulesChart();
  }*/

  ngOnInit() {
      this.route.parent?.paramMap.subscribe(params => {
        this.idTenant = params.get('idTenant');
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        this.loadDashboardData();
        this.loadModulesChart();
      });
  }

  getTargetId(): number {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if ((user?.role === 'superAdmin' || user?.role === 'SUPER_ADMIN') && this.idTenant) {
          return Number(this.idTenant);
      }
      return user?.idUtilisateur;
  }

  loadDashboardData() {
    const targetId = this.getTargetId();
    this.loading = true;
    this.service.getStats(targetId).subscribe({
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



  loadModulesChart() {
    const targetId = this.getTargetId();
    this.service.getLeastUsedModules(targetId).subscribe({
      next: (data) => {
        console.log("Modules stats:", data);

        /*this.modulesChartData = {
          labels: data.map(m => m.nomModule),
          datasets: [
            {
              data: data.map(m => m.totalInscriptions),
              label: 'Modules les moins utilisés(nombre d’inscriptions)'
            }
          ]
        };*/

        this.modulesChartData = {
          labels: data.map(m => m.nomModule),
          datasets: [
            {
              data: data.map(m => m.totalInscriptions),
              label: 'Modules les moins utilisés(nombre d’inscriptions)',

              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;

                if (!chartArea) {
                  return '#ea5357';
                }

                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

                gradient.addColorStop(0, '#303D49');   // gris base
                gradient.addColorStop(0.5, '#ea5357'); // rouge principal
                gradient.addColorStop(1, '#ff8a8a');   // rouge soft

                return gradient;
              },

              borderRadius: 10,   // 👈 BAR ARRONDIES
              borderSkipped: false
            }
          ]
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }



}
