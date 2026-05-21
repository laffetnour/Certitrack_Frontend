import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private etablissementIdSource = new BehaviorSubject<number | null>(null);
  etablissementId$ = this.etablissementIdSource.asObservable();

  private tenantIdSubject = new BehaviorSubject<number | null>(null);
    tenantId$ = this.tenantIdSubject.asObservable();

  constructor(private authService: AuthService) {
    const userEtabId = this.authService.getUser()?.etablissement?.id;
    if (userEtabId) this.etablissementIdSource.next(userEtabId);
  }

  updateEtablissementId(id: number) {
    this.etablissementIdSource.next(id);
  }

  getEtablissementId(): number | undefined {
    return this.etablissementIdSource.getValue() || this.authService.getUser()?.etablissement?.id;
  }


    updateTenantId(id: number): void {
      console.log("Contexte mis à jour : Tenant ID =", id);
      this.tenantIdSubject.next(id);
    }

    getTenantId(): number | null {
      return this.tenantIdSubject.value;
    }
}
