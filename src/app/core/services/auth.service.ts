import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}



  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/signup`, data, {responseType: 'text'});
  }




  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { username, password });
  }

  /*saveUser(data: any) {
    localStorage.setItem('user', JSON.stringify(data));
  }*/

saveUser(data: any) {
  try {
    // 1. On tente de supprimer l'ancienne version pour libérer de l'espace avant d'écrire
    localStorage.removeItem('user');

    // 2. Tentative d'écriture
    localStorage.setItem('user', JSON.stringify(data));
  } catch (e: any) {
    // 3. Si ça s'arrête ici, c'est que c'est trop lourd
    console.warn("Quota Storage dépassé, nettoyage en cours...");

    try {
      // 4. Sauvegarde de secours SANS la photo
      const liteUser = { ...data };
      delete liteUser.photo; // On supprime carrément la clé photo

      localStorage.setItem('user', JSON.stringify(liteUser));
      alert("⚠️ Vos informations ont été enregistrées, mais la photo est trop lourde pour être gardée en mémoire locale.");
    } catch (innerError) {
      // 5. Cas extrême : même sans photo le storage est saturé (autres données)
      console.error("Échec critique du LocalStorage", innerError);
      localStorage.clear(); // On vide tout en dernier recours
    }
  }
}


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

getTenantId(): number | null {
  const user = this.getUser();
  // On descend dans la hiérarchie : user -> tenant -> id
  return user?.tenant?.idTenant || null;
}

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
updateUserOnServer(user: any): Observable<any> {
  const token = this.getToken();
  const headers = { 'Authorization': `Bearer ${token}` };

  return this.http.put(`${this.api}/update-user`, user, { headers });
}

// Dans ton auth.service.ts
sendCode(email: string): Observable<any> {
  return this.http.post(`${this.api}/send-otp`, { email: email });
}

}
