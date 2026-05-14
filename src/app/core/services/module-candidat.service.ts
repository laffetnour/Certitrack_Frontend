import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleCandidatService {

  private baseUrl = 'http://localhost:8080/api/candidat/modules';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getModules(): Observable<any> {
    return this.http.get<any>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  /*inscrire(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/inscriptions/session/${sessionId}`, {}, {
       headers: this.getAuthHeaders()
     });
  }*/



inscrire(sessionId: number, moduleTenantId: number): Observable<any> {
  const payload = {
    sessionId: sessionId,
    moduleTenantId: moduleTenantId
  };

  return this.http.post(`${this.baseUrl}/inscriptions`, payload, {
     headers: this.getAuthHeaders()
   });
}

  getTestInfos(sessionId: number, moduleTenantId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/test/session/${sessionId}/module/${moduleTenantId}`,
      {headers: this.getAuthHeaders()});
  }

  /*startTest(sessionId: number) {
    return this.http.post<any>(
      `http://localhost:8080/api/test/start/${sessionId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }*/

// Dans ton service de test Angular
startTest(sessionId: number, moduleTenantId: number): Observable<any> {
  return this.http.post( `http://localhost:8080/api/test/start/${sessionId}/${moduleTenantId}`, {}
    ,{ headers: this.getAuthHeaders() });
}

  submitTest(epreuveId: number, reponseIds: number[], dureeSecondes: number): Observable<any> {
    // On utilise les backticks `` pour construire l'URL avec le paramètre
    return this.http.post<any>(`http://localhost:8080/api/test/submit/${epreuveId}?dureeSecondes=${dureeSecondes}`
      , reponseIds, { headers: this.getAuthHeaders() });
  }

  getCountInscriptions(idCandidat: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/inscriptions/count/${idCandidat}`
      ,{ headers: this.getAuthHeaders() });
  }

  getEpreuves(idCandidat: number): Observable<any> {
    return this.http.get<any>(
      `http://localhost:8080/api/test/candidat/epreuves/${idCandidat}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getInscriptionsGmetrix(idCandidat: number): Observable<any> {
    return this.http.get<any>(
      `http://localhost:8080/api/candidat/modules/inscriptions/candidat/${idCandidat}/inscriptions-gmetrix`,
      { headers: this.getAuthHeaders() }
    );
  }

  reserverExamen(payload: any): Observable<any> {
    return this.http.post(
      `http://localhost:8080/api/reservations`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }


  getSessionsEnCours(): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/inscriptions/sessions-en-cours`,
      { headers: this.getAuthHeaders() }
    );
  }

  getStatsGmetrix(id: number): Observable<any> {
    return this.http.get(
      `http://localhost:8080/api/candidat/stats-gmetrix/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }


  getCertificationStats(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/stats`,
      { headers: this.getAuthHeaders() }
    );
  }
}
