import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleTenantService {
  private apiUrl = 'http://localhost:8080/api/tenant-modules';
  private apiUrlSession = 'http://localhost:8080/api/session';

  constructor(private http: HttpClient) { }

 addModuleToTenant(userId: number, moduleId: number): Observable<any> {
     const storedUser = localStorage.getItem('user');

     if (!storedUser) {
       console.error("Aucun utilisateur trouvé dans le localStorage !");
       throw new Error("Utilisateur non connecté");
     }

     const user = JSON.parse(storedUser);
     const token = user.token;

     const headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`
     });

     const params = new HttpParams()
       .set('idUtilisateur', userId.toString())
       .set('moduleId', moduleId.toString());
     console.log("Envoi du Token au Backend :", `Bearer ${token.substring(0, 15)}...`);

     return this.http.post(`${this.apiUrl}/add`, null, { params, headers });
 }


 getMyModules(userId: number): Observable<any[]> {
   const userData = localStorage.getItem('user');
   const token = userData ? JSON.parse(userData).token : '';
   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

   return this.http.get<any[]>(`${this.apiUrl}/my-modules/${userId}`, { headers });
 }

  deleteModuleTenant(moduleTenantId: number): Observable<any> {
    const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.delete(`${this.apiUrl}/${moduleTenantId}`, { headers });
  }

  toggleModule(id: number) {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}/toggle`, {}, { headers });
  }

  configTest(id: number, avecTest: boolean, seuilScore: number | null, capacite: number | null) {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token || '';

    let params = new HttpParams()
      .set('avecTest', avecTest.toString());

    if (seuilScore !== null) {
      params = params.set('seuilScore', seuilScore.toString());
    }

    if (capacite !== null) {
      params = params.set('capacite', capacite.toString());
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.apiUrl}/${id}/config-test`, null, { params, headers });
  }

  bulkUpdateStatus(ids: number[], active: boolean): Observable<any> {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('active', active.toString());
    return this.http.put(`${this.apiUrl}/bulk-status`, ids, { params, headers });
  }

  getActiveModules(userId: number): Observable<any[]> {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any[]>(`${this.apiUrl}/active/${userId}`, { headers });
  }

  updateCapacite(id: number, capacite: number) {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const params = new HttpParams().set('capacite', capacite.toString());

    return this.http.put(`${this.apiUrl}/${id}/capacite`, null, { params, headers });
  }



  addSession(moduleId: number, userId: number, session: any): Observable<any> {
    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData).token : '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrlSession}/add/${moduleId}/${userId}`,
      session,
      { headers }
    );
  }

  bulkDelete(ids: number[]): Observable<any> {
    const token = JSON.parse(localStorage.getItem('user') || '{}').token || '';

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(
      `${this.apiUrl}/bulk-delete`,
      ids,
      { headers }
    );
  }
}
