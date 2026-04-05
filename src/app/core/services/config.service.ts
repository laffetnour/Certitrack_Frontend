import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';


export interface Configuration {
  id?: number;
  nomPlateforme: string;
  theme: string;
  logoSociete: string;
  user_id: number; // Structure plate
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'http://localhost:8080/api/config';

  // Le BehaviorSubject permet à toute l'app d'écouter les changements de config (ex: le Logo dans la Sidebar)
  private configSubject = new BehaviorSubject<Configuration | null>(null);
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère la configuration liée à un utilisateur spécifique
   * @param userId L'ID de l'utilisateur connecté
   */
  getConfigByUserId(userId: number): Observable<Configuration> {
    return this.http.get<Configuration>(`${this.apiUrl}/my-config/${userId}`).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Récupère la configuration par défaut (ID 1) pour les visiteurs ou au login
   */
  getConfig(): Observable<Configuration> {
    return this.http.get<Configuration>(this.apiUrl).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  /**
   * Met à jour ou Crée la configuration en BDD
   * Cette méthode envoie l'objet complet (Theme + Logo + Nom)
   */
  updateConfig(config: Configuration): Observable<Configuration> {
      // Si l'ID est présent, on fait un PUT sur l'URL spécifique
      const url = `${this.apiUrl}/update/${config.id}`;
      return this.http.put<Configuration>(url, config).pipe(
        tap(updatedConfig => {
          // C'EST ICI : On diffuse la nouvelle config à travers le BehaviorSubject
          this.configSubject.next(updatedConfig);
        })
      );
    }

  /**
   * Helper pour récupérer la valeur actuelle de la config sans souscrire
   */
  getCurrentConfig(): Configuration | null {
    return this.configSubject.value;
  }
}
