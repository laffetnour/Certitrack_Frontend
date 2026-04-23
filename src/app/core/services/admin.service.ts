import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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


  getCandidats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/candidats`, this.getAuthHeaders());
  }


  getCandidatsBySpecialite(): Observable<any> {
    return this.http.get(`${this.baseUrl}/candidats/by-specialite`, this.getAuthHeaders());
  }


  createCandidat(candidat: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/candidats`, candidat, this.getAuthHeaders());
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

  getSpecialites(): Observable<any> {
    return this.http.get(`${this.baseUrl}/specialites`, this.getAuthHeaders());
  }



  // Dans ton AdminService.ts
  getCandidatCountByEtab(idEtab: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/candidats/count/${idEtab}`, this.getAuthHeaders());
  }

  getSessionsCloturees() {
    return this.http.get(`${this.baseUrl}/sessions/cloturees`, this.getAuthHeaders());
  }

  getResultatsSession(id: number) {
    return this.http.get(`${this.baseUrl}/sessions/${id}/resultats`, this.getAuthHeaders());
  }
}
