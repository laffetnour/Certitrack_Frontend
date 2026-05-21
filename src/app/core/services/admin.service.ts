import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatData {
  label: string;
  value: number;
}
@Injectable({
  providedIn: 'root'
})


export class AdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }


  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      })
    };
  }

private getOptions(etabId?: number) {
    const token = localStorage.getItem('token');
    let params = new HttpParams();
    if (etabId) {
      params = params.set('etabId', etabId.toString());
    }

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      params: params
    };
  }


getStatsModules(idEtab: number): Observable<StatData[]> {
    return this.http.get<StatData[]>(`${this.baseUrl}/stats/modules/${idEtab}`, this.getAuthHeaders());
  }

  getStatsSpecialites(idEtab: number): Observable<StatData[]> {
    return this.http.get<StatData[]>(`${this.baseUrl}/stats/specialites/${idEtab}`, this.getAuthHeaders());
  }


  getCandidats(etabId?: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/candidats`, this.getOptions(etabId));
  }


  getCandidatsBySpecialite(etabId?: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/candidats/by-specialite`, this.getOptions(etabId));
  }


  createCandidat(candidat: any, etabId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/candidats`, candidat, this.getOptions(etabId));
  }


  updateCandidat(id: number, candidat: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/${id}`, candidat, this.getAuthHeaders());
  }



  toggleCandidatStatus(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/candidats/${id}/status`, {}, this.getAuthHeaders());
  }


  activateMultiple(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/activate-multiple`, ids, this.getAuthHeaders());
  }


  deactivateMultiple(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/deactivate-multiple`, ids, this.getAuthHeaders());
  }


  deleteCandidat(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/candidats/${id}`, this.getAuthHeaders());
  }

  getSpecialites(etabId?: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/specialites`,this.getOptions(etabId));
  }




  getCandidatCountByEtab(idEtab: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/candidats/count/${idEtab}`, this.getAuthHeaders());
  }

  getSessionsCloturees(etabId?: number) {
    return this.http.get(`${this.baseUrl}/sessions/cloturees`, this.getOptions(etabId));
  }

  getResultats(filters: any,etabId?: number) {
    let params: any = {};

    if (filters.sessionId) params.sessionId = filters.sessionId;
    if (filters.dateDebut) params.dateDebut = filters.dateDebut;
    if (filters.dateFin) params.dateFin = filters.dateFin;
    if (etabId) params.etabId = etabId;

    return this.http.get(`${this.baseUrl}/resultats`, {
      ...this.getOptions(etabId),
      params
    });
  }

  exportResultats(filters: any, etabId?: number) {
    let params: any = {};

    if (filters.sessionId) params.sessionId = filters.sessionId;
    if (filters.dateDebut) params.dateDebut = filters.dateDebut;
    if (filters.dateFin) params.dateFin = filters.dateFin;
    if (etabId) params.etabId = etabId;

    return this.http.get(`${this.baseUrl}/resultats/export`, {
      ...this.getOptions(etabId),
      params,
      responseType: 'blob'
    });
  }
}
