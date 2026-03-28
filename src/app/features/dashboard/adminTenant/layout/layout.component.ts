import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-tenant-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class AdminTenantLayoutComponent {


  currentUser: any = {};
  constructor(

      private authService: AuthService
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
}
