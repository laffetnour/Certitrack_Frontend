import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';


export interface Configuration {
  id?: number;
  nomPlateforme: string;
  theme: string;
  logoSociete: string;
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'http://localhost:8080/api/config';

  private configSubject = new BehaviorSubject<Configuration | null>(null);
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  getConfigByUserId(userId: number): Observable<Configuration> {
    return this.http.get<Configuration>(`${this.apiUrl}/my-config/${userId}`).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  getConfig(): Observable<Configuration> {
    return this.http.get<Configuration>(this.apiUrl).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  updateConfig(config: Configuration): Observable<Configuration> {
      const url = `${this.apiUrl}/update/${config.id}`;
      return this.http.put<Configuration>(url, config).pipe(
        tap(updatedConfig => {
          this.configSubject.next(updatedConfig);
        })
      );
    }

  getCurrentConfig(): Configuration | null {
    return this.configSubject.value;
  }
}
