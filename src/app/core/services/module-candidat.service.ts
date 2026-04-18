import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleCandidatService {

  private baseUrl = 'http://localhost:8080/api/candidat/modules';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getModules(): Observable<any> {
    return this.http.get<any>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  inscrire(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/inscriptions/session/${sessionId}`, {}, {
       headers: this.getAuthHeaders()
     });
  }
}
