import { Component, OnInit } from '@angular/core';
import { DirecteurService } from '../../../../core/services/directeur.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats: any = null;
  currentUser: any = {};

  constructor(private directeurService: DirecteurService,
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if (user) {
      this.currentUser = JSON.parse(user);
    }

    this.loadStats();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadStats();
      });

  }

  loadStats() {
    this.directeurService.getStats().subscribe({
      next: (data) => {
        console.log("STATS BACKEND =", data);
        this.stats = { ...data };
        this.cdr.detectChanges();// 🔥 IMPORTANT (force refresh)
      },
      error: (err) => {
        console.error('Erreur stats', err);
      }
    });
  }


}
