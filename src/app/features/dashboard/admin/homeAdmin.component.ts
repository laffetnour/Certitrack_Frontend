/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Important pour le router-outlet
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homeAdmin.component.html',
  styleUrls: ['./admin.component.css']
})
export class homeAdminComponent implements OnInit {
  currentUser: any;
  isParcoursOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Récupère l'admin connecté pour afficher son nom dans le header
    this.currentUser = this.authService.getUser();
  }

  toggleParcoursMenu(): void {
    this.isParcoursOpen = !this.isParcoursOpen;
  }

  onLogout(): void {
    this.authService.logout();
  }
}*/

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';


@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homeAdmin.component.html',
  styleUrls: ['./admin.component.css']
})
export class homeAdminComponent implements OnInit {
  currentUser: any;
  isParcoursOpen = false;
  totalCandidats: number = 0;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    private adminService: AdminService,
  private cdr: ChangeDetectorRef
  ) {}



  ngOnInit(): void {

    this.currentUser = this.authService.getUser();

    console.log("ngOnInit - Utilisateur récupéré :", this.currentUser);

    if (this.currentUser) {

      this.loadStats();
    } else {
      console.warn("Pas d'utilisateur trouvé au refresh, redirection login...");
      this.router.navigate(['/login']);
    }
  }
  loadStats(): void {
    const etablissement = this.currentUser?.etablissements?.[0];


    console.log("Objet établissement complet :", etablissement);


    const idToUse = etablissement?.idEtab || etablissement?.id;

    if (idToUse) {
      this.loading = true;
      this.adminService.getCandidatCountByEtab(idToUse).subscribe({
        next: (count: number) => {
          console.log("Nombre de candidats reçu :", count);
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
}
