import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
@Component({
  selector: 'app-directeur-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './directeur-layout.component.html',
  styleUrls: ['./directeur-layout.component.css']
})
export class DirecteurLayoutComponent {

  isParcoursOpen: boolean = false;
  currentUser: any = {};
  tenantLogo: string | null = null;

constructor(private router: Router,private authService: AuthService,public configService: ConfigService) {}
  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.tenantLogo = this.currentUser?.tenantLogo;
      }
  }

 onLogout(): void {
   localStorage.clear();
   this.router.navigate(['/login']);
 }
}
