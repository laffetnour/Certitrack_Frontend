import { Injectable } from '@angular/core';
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
}
