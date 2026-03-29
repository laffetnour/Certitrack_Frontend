import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirecteurService {

  private baseUrl = 'http://localhost:8080/api/directeur';

  constructor(private http: HttpClient) {}

private getAuthHeaders() {
  const token = localStorage.getItem('token');
  console.log("Headers envoyés :", token ? "Token présent" : "TOKEN MANQUANT !");
  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  };
}

  getAdmins(): Observable<any> {
    return this.http.get(`${this.baseUrl}/administrateurs`, this.getAuthHeaders());
  }

  createAdmin(admin: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/administrateurs`, admin, this.getAuthHeaders());
  }

  updateAdmin(id: number, admin: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/administrateurs/${id}`, admin, this.getAuthHeaders());
  }

  toggleAdminStatus(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/administrateurs/${id}/status`, {}, this.getAuthHeaders());
  }

  deleteAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/administrateurs/${id}`, this.getAuthHeaders());
  }

  activateMultiple(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/administrateurs/activate-multiple`, ids, this.getAuthHeaders());
  }

  deactivateMultiple(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/administrateurs/deactivate-multiple`, ids, this.getAuthHeaders());
  }

  deleteMultiple(ids: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/administrateurs/delete-multiple`, ids, this.getAuthHeaders());
  }
  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`, this.getAuthHeaders());
  }


  // ================= SPECIALITES =================

  getSpecialites(): Observable<any> {
    return this.http.get(`${this.baseUrl}/specialites`, this.getAuthHeaders());
  }

  addSpecialite(sp: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/specialites`, sp, this.getAuthHeaders());
  }

  updateSpecialite(id: number, sp: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/specialites/${id}`, sp, this.getAuthHeaders());
  }

  toggleSpecialite(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/specialites/${id}/status`, {}, this.getAuthHeaders());
  }

  deleteSpecialite(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/specialites/${id}`, this.getAuthHeaders());
  }

  activateMultipleSpecialites(ids: number[]) {
    return this.http.put(`${this.baseUrl}/specialites/activate-multiple`, ids, this.getAuthHeaders());
  }

  deactivateMultipleSpecialites(ids: number[]) {
    return this.http.put(`${this.baseUrl}/specialites/deactivate-multiple`, ids, this.getAuthHeaders());
  }

}
