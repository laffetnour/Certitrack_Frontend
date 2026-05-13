import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ReservationDisplayDTO {
  id: number;
  nomCandidat: string;
  prenomCandidat: string;
  emailCandidat: string;
  usernameCertiport: string;
  nomModule: string;
  nomSession: string;
  dateExamen: string;
  dateReservation: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}
  getReservations(etabId: number, sessionId?: number | null): Observable<ReservationDisplayDTO[]> {
    let params = new HttpParams();
    if (sessionId) {
      params = params.set('sessionId', sessionId.toString());
    }
    return this.http.get<ReservationDisplayDTO[]>(`${this.apiUrl}/${etabId}`, { params });
  }
}
