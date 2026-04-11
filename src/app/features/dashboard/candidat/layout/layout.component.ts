import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';

@Component({
  selector: 'app-candidat-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class CandidatLayoutComponent implements OnInit {

  currentUser: any = {};

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
}
