import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionInscService {
  private apiUrl = 'http://localhost:8080/api/sessions-inscription';

  constructor(private http: HttpClient) {}


  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log(localStorage.getItem('token'))
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getSessionsByTenant(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/tenant/${tenantId}`, {
      headers: this.getAuthHeaders()
    });
  }

  creerSession(sessionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/creer`, sessionData, {
      headers: this.getAuthHeaders()
    });
  }

  updateSession(id: number, sessionData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}`, sessionData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Récupère les modules actifs (nécessite aussi l'auth)
   */
  getActiveModules(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/tenant-modules/active/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
