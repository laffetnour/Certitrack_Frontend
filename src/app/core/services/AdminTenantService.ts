import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Directeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  actif: boolean;
  etablissementId?: number;
  statut: boolean;
}

export interface Etablissement {
  idEtab: number;
  nom: string;
  statut: boolean;
  adresse: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTenantService {

  private baseUrl = 'http://localhost:8080/api/admin-tenant';

  constructor(private http: HttpClient) {}


  private getHeaders() {
    const token = localStorage.getItem('token');
    console.log("Token utilisé:", token);
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private url(path: string) {
    return `${this.baseUrl}/${path}`;
  }


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


  deleteMultiple(ids: number[]): Observable<void> {
    return this.http.post<void>(this.url('directeurs/delete-multiple'), ids, this.getHeaders());
  }

  activateMultiple(ids: number[]): Observable<void> {
    return this.http.post<void>(this.url('directeurs/activate'), ids, this.getHeaders());
  }

  deactivateMultiple(ids: number[]): Observable<void> {
    return this.http.post<void>(this.url('directeurs/deactivate'), ids, this.getHeaders());
  }


  getStats(): Observable<any> {
    return this.http.get<any>(this.url('stats'), this.getHeaders());
  }


  getEtablissements(): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(this.url('etablissements'), this.getHeaders());
  }


  createEtablissement(data: any): Observable<any> {
    return this.http.post<any>(this.url('etablissements'), data, this.getHeaders());
  }

  updateEtablissement(id: number, data: any): Observable<any> {
    return this.http.put<any>(this.url(`etablissements/${id}`), data, this.getHeaders());
  }

  deleteEtablissement(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`etablissements/${id}`), this.getHeaders());
  }

  toggleEtablissementStatus(id: number): Observable<any> {
    return this.http.put<any>(this.url(`etablissements/${id}/status`), {}, this.getHeaders());
  }

activateMultipleEtab(ids: number[]): Observable<void> {
  return this.http.post<void>(this.url('etablissements/activate'), ids, this.getHeaders());
}


deactivateMultipleEtab(ids: number[]): Observable<void> {
  return this.http.post<void>(this.url('etablissements/deactivate'), ids, this.getHeaders());
}
}
