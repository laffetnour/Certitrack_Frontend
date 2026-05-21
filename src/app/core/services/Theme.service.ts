import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';

  constructor() {
    this.applyTheme(this.getStoredTheme());
  }

  applyTheme(theme: string): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getStoredTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || 'light';
  }
}
