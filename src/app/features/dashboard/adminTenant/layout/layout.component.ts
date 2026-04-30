import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-tenant-layout',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class AdminTenantLayoutComponent {


  currentUser: any = {};

  searchText: string = '';
  showResults: boolean = false;

  filteredResults: any[] = [];
  constructor(

      private authService: AuthService,
      public configService: ConfigService,private router: Router
    ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  onLogout(): void {
      this.authService.logout();
    }


  searchDatabase = [
    {
      name: 'Dashboard',
      link: '/adminTenant/dashboard',
      icon: 'fas fa-th-large',
      type: 'Page',
      keywords: ['dashboard', 'accueil']
    },
    {
      name: 'Établissements',
      link: '/adminTenant/etablissements',
      icon: 'fas fa-school',
      type: 'Gestion',
      keywords: ['ecole', 'etablissement', 'centre']
    },
    {
      name: 'Directeurs',
      link: '/adminTenant/directeurs',
      icon: 'fas fa-user-tie',
      type: 'Gestion',
      keywords: ['directeur', 'responsable']
    },
    {
      name: 'Modules',
      link: '/adminTenant/moduleTenant',
      icon: 'fas fa-book',
      type: 'Catalogue',
      keywords: ['module','catalogue', 'formation', 'cours']
    },
    {
      name: 'Mes Modules',
      link: '/adminTenant/ListeModuleTenant',
      icon: 'fas fa-book-open',
      type: 'Liste',
      keywords: ['mes modules', 'affectation']
    },
    {
      name: 'Sessions Inscription',
      link: '/adminTenant/session-insc',
      icon: 'fas fa-calendar',
      type: 'Planning',
      keywords: ['session', 'inscription', 'planning']
    },
    {
      name: 'Paramètres',
      link: '/adminTenant/parametre',
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
}
