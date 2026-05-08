import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionExamenService {
  private apiUrl = 'http://localhost:8080/api/sessions-examen';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  /*getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }*/

  /*getModulesLastImport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/modules-last-import`, this.getHeaders());
  }*/

  /*save(session: any): Observable<any> {
    if (session.id) {
      return this.http.put(`${this.apiUrl}/${session.id}`, session, this.getHeaders());
    }
    return this.http.post(this.apiUrl, session, this.getHeaders());
  }*/

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }


getAll(etabId?: number): Observable<any[]> {
  let params = new HttpParams();
  if (etabId) {
    params = params.set('etabId', etabId.toString());
  }
  return this.http.get<any[]>(this.apiUrl, { ...this.getHeaders(), params });
}

save(session: any, etabId?: number): Observable<any> {
  if (session.id) {
    return this.http.put(`${this.apiUrl}/${session.id}`, session, this.getHeaders());
  }

  let params = new HttpParams();
  if (etabId) {
    params = params.set('etabId', etabId.toString());
  }
  return this.http.post(this.apiUrl, session, { ...this.getHeaders(), params });
}

getModulesLastImport(etabId?: number): Observable<any[]> {
  let params = new HttpParams();
  if (etabId) {
    params = params.set('etabId', etabId.toString());
  }
  return this.http.get<any[]>(`${this.apiUrl}/modules-last-import`, { ...this.getHeaders(), params });
}

}
