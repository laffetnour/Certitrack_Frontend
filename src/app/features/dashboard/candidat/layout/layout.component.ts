import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
import { NotificationService, Notification } from '../../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidat-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class CandidatLayoutComponent implements OnInit {

  currentUser: any = {};
  searchText: string = '';
  showResults: boolean = false;
  notifications: Notification[] = [];
  showNotifs = false;

  constructor(
    private authService: AuthService,
    public notifService: NotificationService,
    public configService: ConfigService
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');

    if (user) {
      this.currentUser = JSON.parse(user);
    }
  this.refreshNotifications();
  }

  logout(): void {
    this.authService.logout();
  }





  searchDatabase = [
    {
      name: 'Dashboard',
      link: '/candidat/dashboard',
      icon: 'fas fa-th-large',
      type: 'Page',
      keywords: ['dashboard', 'accueil']
    },
    {
      name: 'Modules disponibles',
      link: '/candidat/modules',
      icon: 'fas fa-book',
      type: 'Inscrire',
      keywords: ['module', 'inscription', 'inscrire', 'formation','modules disponibles']
    },
    {
      name: 'Mes inscriptions',
      link: '/candidat/mes-inscriptions',
      icon: 'fas fa-user-check',
      type: 'mes inscriptions,scores GMetrix,réservation',
      keywords: ['inscription','réservation','réservation examen', 'reservation','examen', 'mes modules', 'gmetrix', 'score','score gemetrix', 'test', 'admission','reservation examen','mes inscriptions']
    },
    {
      name: 'Paramètres',
      link: '/candidat/parametre',
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

  onDelete(id: number | undefined) {
        if (!id) return;
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifService.deleteNotification(id).subscribe({
          next: () => {
            console.log('Notification supprimée avec succès');
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.refreshNotifications();
          }
        });
      }



    isSidebarVisible = false;

          toggleSidebar() {
            this.isSidebarVisible = !this.isSidebarVisible;
          }

}
