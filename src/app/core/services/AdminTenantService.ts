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

private buildUrl(path: string, tenantId?: number | null): string {
    let url = `${this.baseUrl}/${path}`;
    if (tenantId) {
      url += `?tenantId=${tenantId}`;
    }
    return url;
  }



getStats(tenantId?: number | null): Observable<any> {
    return this.http.get<any>(this.buildUrl('stats', tenantId), this.getHeaders());
  }

  getLeastUsedModules(tenantId?: number | null): Observable<any[]> {
    return this.http.get<any[]>(this.buildUrl('stats/modules-least', tenantId), this.getHeaders());
  }



  getDirecteurs(tenantId?: number | null): Observable<any[]> {
    // Note: Utilisation de buildUrl au lieu de la concaténation manuelle
    return this.http.get<any[]>(this.buildUrl('directeurs', tenantId), this.getHeaders());
  }

  createDirecteur(data: any, tenantId?: number | null): Observable<Directeur> {
    return this.http.post<Directeur>(this.buildUrl('directeurs', tenantId), data, this.getHeaders());
  }

  updateDirecteur(id: number, data: any, tenantId?: number | null): Observable<Directeur> {
    return this.http.put<Directeur>(this.buildUrl(`directeurs/${id}`, tenantId), data, this.getHeaders());
  }

  deleteDirecteur(id: number, tenantId?: number | null): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`directeurs/${id}`, tenantId), this.getHeaders());
  }

  toggleDirecteurStatus(id: number, tenantId?: number | null): Observable<Directeur> {
    return this.http.put<Directeur>(this.buildUrl(`directeurs/${id}/status`, tenantId), {}, this.getHeaders());
  }



  deleteMultiple(ids: number[], tenantId?: number | null): Observable<void> {
    return this.http.post<void>(this.buildUrl('directeurs/delete-multiple', tenantId), ids, this.getHeaders());
  }

  activateMultiple(ids: number[], tenantId?: number | null): Observable<void> {
    return this.http.post<void>(this.buildUrl('directeurs/activate', tenantId), ids, this.getHeaders());
  }

  deactivateMultiple(ids: number[], tenantId?: number | null): Observable<void> {
    return this.http.post<void>(this.buildUrl('directeurs/deactivate', tenantId), ids, this.getHeaders());
  }


  getEtablissements(tenantId?: number | null): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(this.buildUrl('etablissements', tenantId), this.getHeaders());
  }

  createEtablissement(data: any, tenantId?: number | null): Observable<any> {
    return this.http.post<any>(this.buildUrl('etablissements', tenantId), data, this.getHeaders());
  }

  updateEtablissement(id: number, data: any, tenantId?: number | null): Observable<any> {
    return this.http.put<any>(this.buildUrl(`etablissements/${id}`, tenantId), data, this.getHeaders());
  }

  deleteEtablissement(id: number, tenantId?: number | null): Observable<void> {
    return this.http.delete<void>(this.buildUrl(`etablissements/${id}`, tenantId), this.getHeaders());
  }

  toggleEtablissementStatus(id: number, tenantId?: number | null): Observable<any> {
    return this.http.put<any>(this.buildUrl(`etablissements/${id}/status`, tenantId), {}, this.getHeaders());
  }

  activateMultipleEtab(ids: number[], tenantId?: number | null): Observable<void> {
    return this.http.post<void>(this.buildUrl('etablissements/activate', tenantId), ids, this.getHeaders());
  }

  deactivateMultipleEtab(ids: number[], tenantId?: number | null): Observable<void> {
    return this.http.post<void>(this.buildUrl('etablissements/deactivate', tenantId), ids, this.getHeaders());
  }


}
