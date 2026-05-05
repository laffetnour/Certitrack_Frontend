import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
import { NotificationService, Notification } from '../../../../core/services/notification.service';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-directeur-layout',
  standalone: true,
  imports: [FormsModule,CommonModule, RouterModule],
  templateUrl: './directeur-layout.component.html',
  styleUrls: ['./directeur-layout.component.css']
})
export class DirecteurLayoutComponent {

  isParcoursOpen: boolean = false;
  currentUser: any = {};
  tenantLogo: string | null = null;
  searchText: string = '';
  showResults: boolean = false;
  notifications: Notification[] = [];
    showNotifs = false;

constructor(private router: Router,
  private authService: AuthService,
  public notifService: NotificationService,
  public configService: ConfigService) {}
  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.tenantLogo = this.currentUser?.tenantLogo;
      }
    this.refreshNotifications();
  }


   searchDatabase = [
      {
        name: 'Dashboard',
        link: '/directeur/dashboard',
        icon: 'fas fa-th-large',
        type: 'Page',
        keywords: ['dashboard', 'accueil','statistique', 'stat']
      },
      {
        name: 'Administrateurs',
        link: '/directeur/administrateurs',
        icon: 'fas fa-user-shield',
        type: 'page',
        keywords: ['admins','gestion des adminstrateurs','creation','compte']
      },
      {
        name: 'Spécialités',
        link: '/directeur/specialites',
        icon: 'fas fa-tags',
        type: 'spécialités,modules pas spécialités',
        keywords: ['specialités','modules','affecter','liste','fixe','autres','ouverte','mode']
      },
      {
        name: 'Candidats',
        link: '/directeur/candidats',
        icon: 'fas fa-user-graduate',
        type: 'page',
        keywords: ['candidats','creer','statut','valider']
      },
      {
          name: 'Résultats des Sessions Inscriptions',
          link: '/directeur/resultats-sessions',
          icon: 'fas fa-chart-line',
          type: 'page',
          keywords: ['resultats','inscriptions','modules','test','score','durée']
        },
      {
          name: 'Session Examen',
          link: '/directeur/sessionsExamen',
          icon: 'fas fa-calendar',
          type: 'page',
          keywords: ['examen','date','certification','centre']
        },
      {
          name: 'Import GMetrix',
          link: '/directeur/import-gmetrix',
          type: 'page',
          keywords: ['resultats','score','gmetrix','import']
      },
      {
          name: 'Paramètres',
          link: '/directeur/parametre',
          icon: 'fas fa-cog',
          type: 'Config',
          keywords: ['parametre', 'settings', 'profil']
        }

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
 onLogout(): void {
   localStorage.clear();
   this.router.navigate(['/login']);
 }

refreshNotifications() {
   const user = this.authService.getUser();
    const userId = user?.idUtilisateur;
    this.notifService.getNotifications(userId).subscribe(data => {
      this.notifications = data;
      console.log("notifie",data);
    });
  }

  toggleNotifs() {
    this.showNotifs = !this.showNotifs;
  }

  onSelect(n: Notification) {
    if (!n.lu && n.id) {
      this.notifService.markAsRead(n.id).subscribe(() => {
        n.lu = true;
        this.refreshNotifications();
      });
    }
  }
}
