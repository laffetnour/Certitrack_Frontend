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



verifyAccount(token: string): Observable<any> {

    return this.http.get(`${this.api}/verify`, {
      params: { token: token }
    });
  }




  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { username, password });
  }



saveUser(data: any) {
  try {
    localStorage.removeItem('user');

    localStorage.setItem('user', JSON.stringify(data));
  } catch (e: any) {
    console.warn("Quota Storage dépassé, nettoyage en cours...");

    try {
      const liteUser = { ...data };
      delete liteUser.photo;

      localStorage.setItem('user', JSON.stringify(liteUser));
      alert("⚠️ Vos informations ont été enregistrées, mais la photo est trop lourde pour être gardée en mémoire locale.");
    } catch (innerError) {
      console.error("Échec critique du LocalStorage", innerError);
      localStorage.clear();
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



sendVerificationLink(userData: any) {
  return this.http.post(`${this.api}/send-verification-link`, userData);
}

requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.api}/forgot-password`, { email });
  }

  verifyResetIdentity(token: string, email: string): Observable<any> {
    return this.http.post(`${this.api}/verify-reset-identity`, { token, email });
  }

  resetPasswordFinal(token: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/reset-password-final`, { token, password });
  }
}
