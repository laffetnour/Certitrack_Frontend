import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GmetrixService {

  private apiUrl = 'http://localhost:8080/api/admin/gmetrix';

  constructor(private http: HttpClient) {}

  // 🔐 récupérer token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 📥 IMPORT EXCEL
  importFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // 📊 GET SCORES AVEC FILTRES
  getScores(filters: any): Observable<any[]> {

    let params = new HttpParams();

    if (filters.sessionId !== null && filters.sessionId !== undefined) {
      params = params.set('sessionId', filters.sessionId);
    }

    if (filters.candidatId) {
      params = params.set('candidatId', filters.candidatId);
    }

    if (filters.classroom) {
      params = params.set('classroom', filters.classroom);
    }

    return this.http.get<any[]>(`${this.apiUrl}/scores`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }
  getScoresBySessionName(name: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/scores/by-session-name`,
      {
        headers: this.getAuthHeaders(),
        params: { sessionName: name }
      }
    );
  }

  getSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions`, {
      headers: this.getAuthHeaders()
    });
  }
}
