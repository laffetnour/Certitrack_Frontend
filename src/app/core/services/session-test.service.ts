/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionTest {
  idSessionTest?: number;
  titre: string;
  dateDebut: string; // ou Date
  dateFin: string;   // ou Date
  etat?: string;     // enCours | cloturee
  dureeMax: number;
  nbreQuestionTechnique: number;
  nbreQuestionComportementale: number;
  moduleTenantId?: number; // ID du module lié
}

@Injectable({
  providedIn: 'root'
})
export class SessionTestService {

  private baseUrl = 'http://localhost:8080/api/session-test';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les sessions
  getAllSessions(): Observable<SessionTest[]> {
    return this.http.get<SessionTest[]>(`${this.baseUrl}/all`);
  }

  // Récupérer les sessions d’un module
  getSessionsByModule(moduleTenantId: number): Observable<SessionTest[]> {
    return this.http.get<SessionTest[]>(`${this.baseUrl}/module/${moduleTenantId}`);
  }

  // Récupérer une session
  getSession(id: number): Observable<SessionTest> {
    return this.http.get<SessionTest>(`${this.baseUrl}/${id}`);
  }

  // Ajouter une session
  addSession(moduleTenantId: number, session: SessionTest): Observable<SessionTest> {
    return this.http.post<SessionTest>(`${this.baseUrl}/add/${moduleTenantId}`, session);
  }

  // Mettre à jour une session
  updateSession(id: number, session: SessionTest): Observable<SessionTest> {
    return this.http.put<SessionTest>(`${this.baseUrl}/update/${id}`, session);
  }

  // Supprimer une session
  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  // Filtrer par état
  getSessionsByEtat(etat: string): Observable<SessionTest[]> {
    return this.http.get<SessionTest[]>(`${this.baseUrl}/etat/${etat}`);
  }

  // 🔥 Modules actifs avec test
  getActiveModulesWithTest(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/active-with-test/${tenantId}`);
  }
}*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionTest {
  idSessionTest?: number;
  titre: string;
  dateDebut: string;
  dateFin: string;
  etat?: string;
  dureeMax: number;
  nbreQuestionTechnique: number;
  nbreQuestionComportementale: number;
  moduleTenantId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionTestService {

  private baseUrl = 'http://localhost:8080/api/session-test';

  constructor(private http: HttpClient) {}

  /**
   * Génère les headers avec le token d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Ou via un AuthService
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer toutes les sessions
  getAllSessions(): Observable<SessionTest[]> {
    return this.http.get<SessionTest[]>(`${this.baseUrl}/all`, { headers: this.getAuthHeaders() });
  }

  // Récupérer les sessions d’un module
  getSessionsByModule(moduleTenantId: number): Observable<SessionTest[]> {
    return this.http.get<SessionTest[]>(`${this.baseUrl}/module/${moduleTenantId}`, { headers: this.getAuthHeaders() });
  }

  // Récupérer une session
  getSession(id: number): Observable<SessionTest> {
    return this.http.get<SessionTest>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Ajouter une session
  addSession(moduleTenantId: number, session: SessionTest): Observable<SessionTest> {
    return this.http.post<SessionTest>(`${this.baseUrl}/add/${moduleTenantId}`, session, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour une session
  updateSession(id: number, session: SessionTest): Observable<SessionTest> {
    return this.http.put<SessionTest>(`${this.baseUrl}/update/${id}`, session, { headers: this.getAuthHeaders() });
  }

  // Supprimer une session
  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  // Filtrer par état
  getSessionsByEtat(etat: string): Observable<SessionTest[]> {
    return this.http.get<SessionTest[]>(`${this.baseUrl}/etat/${etat}`, { headers: this.getAuthHeaders() });
  }

  // Modules actifs avec test
  // Dans SessionTestService (Angular)
  getActiveModulesWithTest(userId: number): Observable<any[]> {
    // L'URL correspond maintenant au nouvel endpoint
    return this.http.get<any[]>(`${this.baseUrl}/active-with-test/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
