import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GmetrixService {

  private apiUrl = 'http://localhost:8080/api/admin/gmetrix';

  constructor(private http: HttpClient) {}

  // 🔐 récupérer token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


importFile(file: File, etabId?: number): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  if (etabId) {
    formData.append('etabId', etabId.toString());
  }

  return this.http.post(`${this.apiUrl}/import`, formData, {
    headers: this.getAuthHeaders()
  });
}

private getOptions(etabId?: number) {
  const token = localStorage.getItem('token');
  let params = new HttpParams();
  if (etabId) params = params.set('etabId', etabId.toString());

  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }),
    params: params
  };
}

/*private getOptions(etabId?: number) {
    const token = localStorage.getItem('token');
    let params = new HttpParams();
    if (etabId) {
      params = params.set('etabId', etabId.toString());
    }

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      params: params
    };
  }

  importFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import`, formData, {
      headers: this.getAuthHeaders()
    });
  }*/

  getScores(filters: any,etabId?: number): Observable<any[]> {

    let params = new HttpParams();

    if (filters.sessionId !== null && filters.sessionId !== undefined) {
      params = params.set('sessionId', filters.sessionId);
    }

    if (filters.candidatId) {
      params = params.set('candidatId', filters.candidatId);
    }

    if (filters.classroom) {
      params = params.set('classroom', filters.classroom);
    }
    if (etabId) params = params.set('etabId', etabId.toString());

    return this.http.get<any[]>(`${this.apiUrl}/scores`, {
      ...this.getOptions(etabId),
      params: params
    });
  }
  getScoresBySessionName(name: string,etabId?: number) {
    const queryParams: any = { sessionName: name };
    let params = new HttpParams();
     if (etabId) params = params.set('etabId', etabId.toString());

    return this.http.get<any[]>(
      `${this.apiUrl}/scores/by-session-name`,
      {
        ...this.getOptions(etabId),
        params: queryParams
      }
    );
  }

  getSessions(etabId?: number): Observable<any[]> {
    let params = new HttpParams();
      if (etabId) {
        params = params.set('etabId', etabId.toString());
      }
    return this.http.get<any[]>(`${this.apiUrl}/sessions`, {
      ...this.getOptions(etabId),
      params: params
    });
  }
}
