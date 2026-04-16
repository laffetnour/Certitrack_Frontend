import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface Session {
  id?: number;
  titre: string;
  dateDebut: string;
  dateFin: string;
  dureeMax?: number;
  nbreQuestionTechnique?: number;
  etat?: string;
  moduleTenant?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SessionInscService {

  private api = 'http://localhost:8080/api/session';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ================= SESSIONS =================

  getMySessions(userId: number): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.api}/my/${userId}`,
      this.getHeaders()
    );
  }

  getSessionsByModule(moduleId: number): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.api}/module/${moduleId}`,
      this.getHeaders()
    );
  }

  // SessionInscService.ts

  addSession(moduleId: number, userId: number, session: Session) {
    // L'ordre dans l'URL doit correspondre au Controller : /add/{moduleId}/{userId}
    return this.http.post(
      `${this.api}/add/${moduleId}/${userId}`, // Vérifiez bien l'ordre ici
      session,
      this.getHeaders()
    );
  }

  updateSession(id: number, userId: number, session: Session) {
    return this.http.put(
      `${this.api}/update/${id}/${userId}`,
      session,
      this.getHeaders()
    );
  }

  deleteSession(id: number, userId: number) {
    return this.http.delete(
      `${this.api}/${id}/${userId}`,
      this.getHeaders()
    );
  }

  getModules(userId: number) {
    return this.http.get<any[]>(
      `${this.api}/modules/${userId}`,
      this.getHeaders()
    );
  }

}
