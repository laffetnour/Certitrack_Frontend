import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
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

  constructor(
    private authService: AuthService,
    public configService: ConfigService
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');

    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  logout(): void {
    this.authService.logout();
  }





  searchDatabase = [
    {
      name: 'Dashboard',
      link: '/candidat/dashboard',
      icon: 'fas fa-th-large',
      keywords: ['dashboard', 'accueil']
    },
    {
      name: 'Modules disponibles',
      link: '/candidat/modules',
      icon: 'fas fa-book',
      keywords: ['module', 'inscription', 'inscrire', 'formation','modules disponibles']
    },
    {
      name: 'Mes inscriptions',
      link: '/candidat/mes-inscriptions',
      icon: 'fas fa-user-check',
      keywords: ['inscription','réservation','réservation examen', 'reservation','examen', 'mes modules', 'gmetrix', 'score', 'test', 'admission','reservation examen','mes inscriptions']
    },
    {
      name: 'Paramètres',
      link: '/candidat/parametre',
      icon: 'fas fa-cog',
      keywords: ['parametre', 'settings', 'profil']
    }
  ];

  filteredResults: any[] = [];

  onSearch() {
    const search = this.searchText.toLowerCase().trim();

    if (search.length > 1) {
      this.showResults = true;

      this.filteredResults = this.searchDatabase.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.keywords.some(keyword => keyword.includes(search))
      );

    } else {
      this.showResults = false;
    }
  }

  selectResult(link: string) {
    window.location.href = link; // ou this.router.navigate([link])
    this.searchText = '';
    this.showResults = false;
  }
}
