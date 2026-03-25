import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// 🔹 Optionnel : définir des interfaces pour le typage
export interface Directeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  actif: boolean;
  etablissementId?: number;
}

export interface Etablissement {
  idEtab: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTenantService {

  private baseUrl = 'http://localhost:8080/api/admin-tenant';

  constructor(private http: HttpClient) {}

  // 🔹 Crée les headers avec le token
  private getHeaders() {
    const token = localStorage.getItem('token');
    console.log("Token utilisé:", token); // <--- Vérifie si ce n'est pas null
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }
  // 🔹 Pour construire les URLs complètes
  private url(path: string) {
    return `${this.baseUrl}/${path}`;
  }

  // ========================== DIRECTEURS ==========================
  getDirecteurs(): Observable<Directeur[]> {
    return this.http.get<Directeur[]>(this.url('directeurs'), this.getHeaders());
  }

  createDirecteur(data: any): Observable<Directeur> {
    return this.http.post<Directeur>(this.url('directeurs'), data, this.getHeaders());
  }

  updateDirecteur(id: number, data: any): Observable<Directeur> {
    return this.http.put<Directeur>(this.url(`directeurs/${id}`), data, this.getHeaders());
  }

  deleteDirecteur(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`directeurs/${id}`), this.getHeaders());
  }

  toggleDirecteurStatus(id: number): Observable<Directeur> {
    return this.http.put<Directeur>(this.url(`directeurs/${id}/status`), {}, this.getHeaders());
  }

  // ========================== BULK ==========================
  deleteMultiple(ids: number[]): Observable<void> {
    return this.http.post<void>(this.url('directeurs/delete-multiple'), ids, this.getHeaders());
  }

  activateMultiple(ids: number[]): Observable<void> {
    return this.http.post<void>(this.url('directeurs/activate'), ids, this.getHeaders());
  }

  deactivateMultiple(ids: number[]): Observable<void> {
    return this.http.post<void>(this.url('directeurs/deactivate'), ids, this.getHeaders());
  }

  // ========================== STATS ==========================
  getStats(): Observable<any> {
    return this.http.get<any>(this.url('stats'), this.getHeaders());
  }

  // ========================== ETABLISSEMENTS ==========================
  getEtablissements(): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(this.url('etablissements'), this.getHeaders());
  }
}
