import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import {ChangeDetectorRef } from '@angular/core';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superAdmin.component.html',
  styleUrls: ['./superAdmin.component.css']
})
export class SuperAdminComponent implements OnInit {
  currentUser: any;
  adminsList: any[] = [];
  stats: any = { tenants: 0, etablissements: 0, admins: 0 };
  isLoading: boolean = false;

  constructor(
    private superAdminService: SuperAdminService,
    private authService: AuthService,
  private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      stats: this.superAdminService.getDashboardStats(),
      admins: this.superAdminService.getAllAdmins()
    }).subscribe({
      next: (result) => {
        console.log("Données reçues :", result);

        // On assigne les données
        this.stats = result.stats;
        this.adminsList = result.admins;

        this.isLoading = false;

        // 3. FORCEZ LA MISE À JOUR DE LA VUE
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  toggleStatus(id: number): void {
    this.superAdminService.toggleAdminStatus(id).subscribe({
      next: () => this.loadDashboardData(),
      error: () => alert("Erreur lors de la modification du statut")
    });
  }

  deleteAdmin(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet administrateur ?')) {
      this.superAdminService.deleteAdmin(id).subscribe({
        next: () => {
          // On recharge tout pour mettre à jour les stats et la liste proprement
          this.loadDashboardData();
        },
        error: (err) => console.error("Erreur suppression:", err)
      });
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
