import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleCandidatService } from '../../../../../core/services/module-candidat.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-qcm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qcm.component.html',
  styleUrls: ['./qcm.component.css']
})
export class QcmComponent implements OnInit {

  epreuve: any;
  questions: any[] = [];
  currentIndex = 0;

  selectedAnswers: number[] = [];

  timeLeft!: number;
  interval: any;

  scoreFinal: number | null = null;
  testTermine = false;

  constructor(private service: ModuleCandidatService,
    private cdr: ChangeDetectorRef,
    private router: Router) {}

  /*ngOnInit(): void {

    this.epreuve = history.state.epreuve || JSON.parse(localStorage.getItem('epreuve') || 'null');

    if (!this.epreuve) {
      alert("Session expirée");
      return;
    }



    localStorage.setItem('epreuve', JSON.stringify(this.epreuve));

    //this.questions = this.epreuve.questions;

    this.questions = [...this.epreuve.questions].sort((a, b) => {
        const natureA = a.question.nature;
        const natureB = b.question.nature;

        if (natureA === 'technique' && natureB !== 'technique') return -1;
        if (natureA !== 'technique' && natureB === 'technique') return 1;
        return 0;
      });

    this.timeLeft = this.epreuve.duree * 60;

    this.startTimer();
  }*/

ngOnInit(): void {
    // Récupération de l'épreuve (soit via le state, soit via le storage)
    this.epreuve = history.state.epreuve || JSON.parse(localStorage.getItem('epreuve') || 'null');

    if (!this.epreuve) {
          alert("Session expirée");
          this.router.navigate(['/candidat/mes-modules']); // 3. Maintenant cela fonctionnera
          return;
        }

    // Sauvegarde pour éviter de perdre le test au rafraîchissement
    //localStorage.setItem('epreuve', JSON.stringify(this.epreuve));
    // SAUVEGARDE OPTIMISÉE : On ne ré-enregistre que si nécessaire
      try {
        const stored = localStorage.getItem('epreuve');
        if (!stored || JSON.parse(stored).idEpreuve !== this.epreuve.idEpreuve) {
           localStorage.setItem('epreuve', JSON.stringify(this.epreuve));
        }
      } catch (e) {
        console.warn("Quota Storage dépassé, nettoyage en cours...");
        localStorage.removeItem('epreuve'); // On nettoie les vieux tests
        try {
          localStorage.setItem('epreuve', JSON.stringify(this.epreuve));
        } catch (e2) {
          console.error("L'épreuve est trop lourde pour le navigateur.");
        }
      }

    // Tri des questions : Techniques d'abord, puis Comportementales
    this.questions = [...this.epreuve.questions].sort((a, b) => {
      const natureA = a.question.nature;
      const natureB = b.question.nature;
      if (natureA === 'technique' && natureB !== 'technique') return -1;
      if (natureA !== 'technique' && natureB === 'technique') return 1;
      return 0;
    });

    // Initialisation du timer (duree est en minutes dans le backend)
    this.timeLeft = this.epreuve.duree * 60;
    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timeLeft--;

      this.cdr.detectChanges();

      if (this.timeLeft <= 0) {
        this.submit();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get currentQuestion() {
    return this.questions[this.currentIndex].question;
    }

    get currentSectionTitle(): string {
      const nature = this.currentQuestion?.nature;
      return nature === 'technique'
        ? 'Partie 1 : Validation Technique'
        : 'Partie 2 : Engagement & Comportement';
    }

  selectAnswer(repId: number, isMultiple: boolean) {
    if (!isMultiple) {
      this.selectedAnswers = this.selectedAnswers.filter(
        id => !this.isAnswerFromCurrentQuestion(id)
      );
      this.selectedAnswers.push(repId);
    } else {
      if (this.selectedAnswers.includes(repId)) {
        this.selectedAnswers = this.selectedAnswers.filter(id => id !== repId);
      } else {
        this.selectedAnswers.push(repId);
      }
    }
  }

  isAnswerFromCurrentQuestion(repId: number): boolean {
    return this.currentQuestion.reponses.some((r: any) => r.idReponse === repId);
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      this.submit();
    }
  }

  /*canGoNext(): boolean {
    const selected = this.selectedAnswers.filter(id =>
      this.isAnswerFromCurrentQuestion(id)
    );

    if (this.currentQuestion.type === 'choixUnique') {
      return selected.length === 1;
    }

    if (this.currentQuestion.type === 'choixMultiple') {
      return selected.length >= 2;
    }

    return false;
  }*/

  canGoNext(): boolean {
    if (!this.currentQuestion) return false;

    const selectedForThisQuestion = this.selectedAnswers.filter(id =>
      this.isAnswerFromCurrentQuestion(id)
    );

    if (this.currentQuestion.type === 'choixUnique') {
      return selectedForThisQuestion.length === 1;
    }
    if (this.currentQuestion.type === 'choixMultiple') {
      const nbBonnesReponsesAttendues = this.currentQuestion.reponses.filter(
        (r: any) => r.score > 0
      ).length;

      return selectedForThisQuestion.length === nbBonnesReponsesAttendues;
    }

    return false;
  }

  submit() {
    clearInterval(this.interval);
    const tempsTotalInitial = this.epreuve.duree * 60;
    const dureeConsommee = tempsTotalInitial - this.timeLeft;

    localStorage.removeItem('epreuve');

    this.service.submitTest(this.epreuve.idEpreuve, this.selectedAnswers, dureeConsommee)
      .subscribe({
        next: (res) => {
          //this.scoreFinal = res.scoreFinal;
          this.testTermine = true;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  getNbAttendues(): number {
    return this.currentQuestion?.reponses?.filter((r: any) => r.score > 0).length || 0;
  }
}
