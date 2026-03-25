import { Component, OnInit } from '@angular/core';
import { AdminTenantService } from '../../../../core/services/AdminTenantService';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  stats: any = {};
  currentUser: any;

  constructor(private service: AdminTenantService) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    this.service.getStats().subscribe(res => {
      this.stats = res;
    });
  }
}
