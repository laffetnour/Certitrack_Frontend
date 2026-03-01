import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  // Méthode pour ajouter le JWT dans les headers
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      })
    };
  }

  // GET tous les candidats
  getCandidats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/candidats`, this.getAuthHeaders());
  }

  // POST créer un candidat
  createCandidat(candidat: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/candidats`, candidat, this.getAuthHeaders());
  }

  // PUT modifier un candidat
  updateCandidat(id: number, candidat: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/${id}`, candidat, this.getAuthHeaders());
  }

  // PUT activer/désactiver un candidat
  toggleCandidatStatus(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/${id}/status`, {}, this.getAuthHeaders());
  }

  // PUT activer plusieurs candidats
  activateMultiple(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/activate-multiple`, ids, this.getAuthHeaders());
  }

  // PUT désactiver plusieurs candidats
  deactivateMultiple(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidats/deactivate-multiple`, ids, this.getAuthHeaders());
  }

  // DELETE un candidat
  deleteCandidat(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/candidats/${id}`, this.getAuthHeaders());
  }
}
