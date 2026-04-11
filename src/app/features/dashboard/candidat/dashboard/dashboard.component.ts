import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-candidat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardCandidatComponent implements OnInit {

  currentUser: any;

  stats = {
    sessionsDisponibles: 0,
    inscriptions: 0,
    approuvees: 0,
    attente: 0
  };

  constructor() {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadStats();
  }

  loadStats() {
    this.stats = {
      sessionsDisponibles: 5,
      inscriptions: 3,
      approuvees: 2,
      attente: 1
    };
  }
}
