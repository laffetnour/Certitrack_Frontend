// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // <--- TRÈS IMPORTANT
})
export class ThemeService {
  private readonly THEME_KEY = 'user-theme';

  constructor() {
    // On applique le thème dès que le service est créé au démarrage
    this.applyTheme(this.getStoredTheme());
  }

  toggleTheme(): void {
    const newTheme = this.getStoredTheme() === 'light' ? 'dark' : 'light';
    localStorage.setItem(this.THEME_KEY, newTheme);
    this.applyTheme(newTheme);
  }

  getStoredTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || 'light';
  }

  private applyTheme(theme: string): void {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

setTheme(theme: string) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('app-theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('app-theme', 'light');
  }
}
}
