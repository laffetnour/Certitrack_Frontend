import { Injectable } from '@angular/core';
import { HttpHeaders,HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';



export interface ResultatExamenDisplayDTO {
  id: number;
  nomCompletCandidat: string;
  usernameCertiport: string;
  nomExamen: string;
  score: number;
  resultat: string;
  proctorName: string;
  dateExamen: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultatExamenService {
  private apiUrl = `http://localhost:8080/api/resultatsExamen`;

  constructor(private http: HttpClient,
    private authService: AuthService) {}

   private getHeaders() {
      const token = this.authService.getToken();
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      };
    }

  downloadTemplate(sessionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template/${sessionId}`, {
      ...this.getHeaders(),
      responseType: 'blob'
    });
  }


importExcel(file: File, sessionId: number): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(`${this.apiUrl}/import/${sessionId}`, formData, {...this.getHeaders()});
}

  getResultatsBySession(sessionId: number): Observable<ResultatExamenDisplayDTO[]> {
    return this.http.get<ResultatExamenDisplayDTO[]>(`${this.apiUrl}/session/${sessionId}`, {...this.getHeaders()});
  }


  getMyResults(candidatId: number): Observable<ResultatExamenDisplayDTO[]> {
    return this.http.get<ResultatExamenDisplayDTO[]>(
      `${this.apiUrl}/mes-resultats/${candidatId}`,
      { ...this.getHeaders() }
    );
  }


}
