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
    return this.http.post(`${this.api}/signup`, data, {
      headers: { 'Content-Type': 'application/json' } // <-- pas de parenthèse ici
    });
  }

  /*register(data:any):Observable<any>{

    return this.http.post(`${this.api}/signup`,data);

  }*/


  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { username, password });
  }

  saveUser(data: any) {
    localStorage.setItem('user', JSON.stringify(data));
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user')!);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}
