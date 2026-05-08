/*import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ContextService {
  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  getEtablissementId(): number {
    let route = this.route.snapshot;
    while (route.firstChild) { route = route.firstChild; }
    const idParam = route.paramMap.get('idEtab');

    if (idParam) return +idParam;

    return this.authService.getUser()?.etablissement?.id;
  }
}*/

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private etablissementIdSource = new BehaviorSubject<number | null>(null);
  // Observable que les composants peuvent écouter
  etablissementId$ = this.etablissementIdSource.asObservable();

  constructor(private authService: AuthService) {
    // Initialisation par défaut avec l'user
    const userEtabId = this.authService.getUser()?.etablissement?.id;
    if (userEtabId) this.etablissementIdSource.next(userEtabId);
  }

  // Cette méthode sera appelée par ton Layout
  updateEtablissementId(id: number) {
    this.etablissementIdSource.next(id);
  }

  getEtablissementId(): number | undefined {
    return this.etablissementIdSource.getValue() || this.authService.getUser()?.etablissement?.id;
  }
}
