import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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


  ngOnInit(): void {
    const user = localStorage.getItem('user');

    if (user) {
      this.currentUser = JSON.parse(user);
    }
  }

  onLogout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

}
