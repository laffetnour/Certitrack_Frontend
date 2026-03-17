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
import { AdminService } from '../../../core/services/admin.service'; // Ajustez le chemin

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
  totalCandidats: number = 0; // Pour stocker le nombre de candidats
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    private adminService: AdminService, // Injection du service
  private cdr: ChangeDetectorRef
  ) {}

  /*ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadStats();
  }

  loadStats(): void {
    // 1. On récupère l'ID de l'établissement depuis l'utilisateur connecté
    // On vérifie d'abord que l'utilisateur et sa liste d'établissements existent
    const etablissement = this.currentUser?.etablissements?.[0];
    const idEtab = etablissement?.idEtab;

    if (idEtab) {
      this.loading = true; // Optionnel : pour afficher un spinner

      // 2. Appel au service (AdminService)
      // On utilise la méthode qui filtre par rôle et établissement au backend
      this.adminService.getCandidatCountByEtab(idEtab).subscribe({
        next: (count: number) => { // 'count' est un nombre, plus besoin de .length
          this.totalCandidats = count;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
        }
      });
    } else {
      console.warn("Impossible de charger les stats : aucun établissement trouvé pour cet utilisateur.");
    }
  }*/

  ngOnInit(): void {
    // 1. On récupère d'abord l'utilisateur depuis le localStorage
    this.currentUser = this.authService.getUser();

    console.log("ngOnInit - Utilisateur récupéré :", this.currentUser);

    if (this.currentUser) {
      // 2. Seulement s'il existe, on charge les stats
      this.loadStats();
    } else {
      console.warn("Pas d'utilisateur trouvé au refresh, redirection login...");
      this.router.navigate(['/login']);
    }
  }
  loadStats(): void {
    const etablissement = this.currentUser?.etablissements?.[0];

    // LOG DE DEBUG : Regarde bien dans la console F12 ce qui s'affiche ici
    console.log("Objet établissement complet :", etablissement);

    // Remplace 'idEtab' par le nom exact que tu vois dans le log ci-dessus (ex: id, ou idEtablissement)
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
  // ... vos autres méthodes (toggleParcoursMenu, onLogout)
  toggleParcoursMenu(): void {
    this.isParcoursOpen = !this.isParcoursOpen;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
