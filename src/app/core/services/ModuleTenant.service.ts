import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleTenantService {
  private apiUrl = 'http://localhost:8080/api/tenant-modules';

  constructor(private http: HttpClient) { }

  /**
   * Ajoute un module du catalogue au tenant spécifique
   * Utilise HttpParams car le Backend attend des @RequestParam
   */
 addModuleToTenant(userId: number, moduleId: number): Observable<any> {
     // 1. Récupérer l'objet user complet depuis le localStorage
     // Vérifie bien si la clé est 'user' ou 'currentUser' (regarde ton Inspecteur > Application)
     const storedUser = localStorage.getItem('user');

     if (!storedUser) {
       console.error("Aucun utilisateur trouvé dans le localStorage !");
       throw new Error("Utilisateur non connecté");
     }

     const user = JSON.parse(storedUser);
     const token = user.token; // On extrait le jeton JWT

     // 2. Créer les Headers (C'est ICI que ça se jouait)
     const headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`
     });

     // 3. Créer les Paramètres
     const params = new HttpParams()
       .set('idUtilisateur', userId.toString())
       .set('moduleId', moduleId.toString());

     // 4. Envoyer la requête avec les options { params, headers }
     console.log("Envoi du Token au Backend :", `Bearer ${token.substring(0, 15)}...`);

     return this.http.post(`${this.apiUrl}/add`, null, { params, headers });
   }

  /**
   * Récupère la liste des modules déjà possédés par le tenant
   */
 getMyModules(userId: number): Observable<any[]> {
   const userData = localStorage.getItem('user');
   const token = userData ? JSON.parse(userData).token : '';
   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

   // On change l'URL pour pointer vers le nouvel endpoint basé sur l'USER ID
   return this.http.get<any[]>(`${this.apiUrl}/my-modules/${userId}`, { headers });
 }

  /**
   * Retire un module du catalogue du tenant
   */
  deleteModuleTenant(moduleTenantId: number): Observable<any> {
    const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.delete(`${this.apiUrl}/${moduleTenantId}`, { headers });
  }

/*getAvailableModules(): Observable<any[]> {
  const userData = localStorage.getItem('user');
  const token = userData ? JSON.parse(userData).token : '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  // Cette URL doit pointer vers ton controller de modules globaux
  return this.http.get<any[]>('http://localhost:8080/api/modules', { headers });
}*/
}
