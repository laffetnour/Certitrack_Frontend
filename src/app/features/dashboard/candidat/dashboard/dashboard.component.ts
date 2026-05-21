import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionInscService } from '../../../../core/services/session-insc.service';
import { ModuleCandidatService } from '../../../../core/services/module-candidat.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartConfiguration } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-candidat',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardCandidatComponent implements OnInit {

  currentUser: any;
  stats = {
    sessionsDisponibles: 0,
    inscriptions: 0,
    totalCertifications: 0,
    passedCertifications: 0,
    failedCertifications: 0
  };

  statsCircle = {
    eligibleReserve: 0,
    eligibleNonReserve: 0,
    nonEligible: 0,

  };

  constructor(
    private sessionService: SessionInscService,
    private inscriptionService: ModuleCandidatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadStats();
    this.loadCircle();
    this.loadCertificationStats();
  }

  loadStats() {
   const userId = this.currentUser?.idUtilisateur;

    if (userId) {

      this.inscriptionService.getSessionsEnCours().subscribe({
        next: (count) => {
          this.stats.sessionsDisponibles = count;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur sessions:', err)
      });

         this.inscriptionService.getCountInscriptions(userId).subscribe({
           next: (count) => {

             this.stats.inscriptions = count;
             this.cdr.detectChanges();
           },
           error: (err) => console.error('Erreur stats inscriptions:', err)
         });
       }

  }


  loadCircle() {
    const id = this.currentUser?.idUtilisateur;
    console.log("USER:", this.currentUser);
    console.log("ID:", this.currentUser?.idUtilisateur);

    this.inscriptionService.getStatsGmetrix(id).subscribe(res => {
      this.statsCircle = res;

      this.circleChartData = {
        ...this.circleChartData,
        datasets: [{
          data: [
            res.eligibleReserve,
            res.eligibleNonReserve,
            res.nonEligible
          ],
          backgroundColor: [
            '#ea5357',
            '#f97316',
            '#ef4444'

          ],
          borderWidth: 0
        }]
      };

      this.cdr.detectChanges();
    });
  }

  public circleChartData: ChartData<'doughnut'> = {
    labels: ['Eligible réservé', 'Eligible non réservé', 'Non éligible'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        '#ea5357',
        '#f97316',
        '#ef4444'
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 15
    }]
  };

  public circleChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: '70%',

    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    },

    plugins: {
      legend: {
        position: 'left',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 14,
          boxWidth: 10,
          color: '#9ca3af',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },



      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        padding: 12,
        cornerRadius: 10,
        displayColors: false
      }
    }
  };



  loadCertificationStats() {

    this.inscriptionService.getCertificationStats().subscribe({
      next: (res) => {

        this.stats.totalCertifications = res.total;
        this.stats.passedCertifications = res.passed;
        this.stats.failedCertifications = res.failed;

        this.barChartData = {
          labels: ['Total', 'PASS', 'FAIL'],
          datasets: [
            {
              data: [
                res.total,
                res.passed,
                res.failed
              ],

              backgroundColor: [
                '#7e9cdd',
                '#91e4b2',
                '#d88e8e'
              ],

              borderRadius: 8,
              borderSkipped: false
            }
          ]
        };

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erreur stats certifications', err);
      }
    });

  }

  public barChartData: ChartData<'bar'> = {
    labels: ['Total', 'PASS', 'FAIL'],
    datasets: [
      {
        data: [0, 0, 0]
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {

    responsive: true,
    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        cornerRadius: 10
      }
    },

    scales: {

      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
}
