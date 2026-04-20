import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleCandidatService } from '../../../../../core/services/module-candidat.service';
import { ChangeDetectorRef } from '@angular/core';

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

  constructor(private service: ModuleCandidatService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {

    // 🔒 récupération depuis navigation OU localStorage
    this.epreuve = history.state.epreuve || JSON.parse(localStorage.getItem('epreuve') || 'null');

    if (!this.epreuve) {
      alert("Session expirée");
      return;
    }

    // 🔒 sauvegarde pour refresh
    localStorage.setItem('epreuve', JSON.stringify(this.epreuve));

    this.questions = this.epreuve.questions;

    // ⏱ timer
    this.timeLeft = this.epreuve.duree * 60;

    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timeLeft--;

      // 🔥 FORCER UPDATE UI
      this.cdr.detectChanges();

      if (this.timeLeft <= 0) {
        this.submit();
      }
    }, 1000);
  }

  // ⏱ format mm:ss
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get currentQuestion() {
    return this.questions[this.currentIndex].question;
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

  canGoNext(): boolean {
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
  }

  /*submit() {
    clearInterval(this.interval);

    // 🔒 nettoyage localStorage
    localStorage.removeItem('epreuve');

    this.service.submitTest(this.epreuve.idEpreuve, this.selectedAnswers)
      .subscribe({
        next: (res) => {
          alert("Score : " + res.scoreFinal);
        },
        error: (err) => console.error(err)
      });
  }*/
  submit() {
    clearInterval(this.interval);

    localStorage.removeItem('epreuve');

    this.service.submitTest(this.epreuve.idEpreuve, this.selectedAnswers)
      .subscribe({
        next: (res) => {
          this.scoreFinal = res.scoreFinal;
          this.testTermine = true;
        },
        error: (err) => console.error(err)
      });
  }
}
