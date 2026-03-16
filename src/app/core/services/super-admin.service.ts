import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private baseUrl = 'http://localhost:8080/api/super-admin';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // --- STATISTIQUES ---
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`, this.getAuthHeaders());
  }

  // --- GESTION DES ADMINS ---
  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admins`, this.getAuthHeaders());
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admins/${id}`, this.getAuthHeaders());
  }

  toggleAdminStatus(id: number): Observable<any> {
    // On passe un objet vide {} car c'est un PUT
    return this.http.put(`${this.baseUrl}/admins/${id}/status`, {}, this.getAuthHeaders());
  }

  // --- GESTION DES TENANTS ---
  getTenants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tenants`, this.getAuthHeaders());
  }
}
