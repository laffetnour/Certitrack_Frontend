import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpecialiteModuleService {


  private readonly BASE_URL = 'http://localhost:8080/api/specialite-modules';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }

 affecterModules(payload: any): Observable<any> {

   return this.http.post<any>(`${this.BASE_URL}/affecter`, payload,  { headers: this.getAuthHeaders() });
 }

  getModulesBySpec(specialiteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/specialite/${specialiteId}`,{ headers: this.getAuthHeaders() });
  }

 updateModeBySpec(specId: number, mode: string): Observable<void> {
   const params = new HttpParams().set('mode', mode);
   //const headers = this.getAuthHeaders().headers;

   return this.http.put<void>(
     `${this.BASE_URL}/specialite/${specId}/mode`,
     {},
     {
       headers: this.getAuthHeaders(),
       params: params
     }
   );
 }

  deleteLiaison(idLiaison: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${idLiaison}`, { headers: this.getAuthHeaders() });
  }

// Récupère absolument toutes les liaisons Module-Spécialité existantes
    getAllSpecialiteModules(): Observable<any[]> {
      return this.http.get<any[]>(`${this.BASE_URL}/all`, {
        headers: this.getAuthHeaders() // Syntaxe correcte : headers attend un objet HttpHeaders
      });
    }

}
