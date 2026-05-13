import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultatExamenService, ResultatExamenDisplayDTO } from '../../../../core/services/resultatExamen.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mes-resultats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './MesResultatsExamen.component.html',
  styleUrls: ['./MesResultatsExamen.component.css']
})
export class MesResultatsExamenComponent implements OnInit {
  mesResultats: ResultatExamenDisplayDTO[] = [];
  loading: boolean = false;
  userName: string = '';

  constructor(
    private resultatService: ResultatExamenService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadMyResults();
  }

  loadMyResults(): void {
    const user = this.authService.getUser();
    if (!user || !user.idUtilisateur) return;

    this.loading = true;
    console.log("user id ",user.idUtilisateur);
    this.resultatService.getMyResults(user.idUtilisateur).subscribe({
      next: (data) => {
        console.log("data: ",data);
        this.mesResultats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getResultClass(resultat: string): string {
      if (!resultat) return 'bg-secondary';
      return resultat.toUpperCase() === 'PASS' ? 'bg-success' : 'bg-danger';
  }

  getScorePercentage(score: number): number {
    return (score / 1000) * 100;
  }
}
