import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Notification {
  id?: number;
  titre: string;
  message: string;
  dateCreation: Date;
  lu: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(notifs => {
        const count = notifs.filter(n => !n.lu).length;
        this.unreadCountSubject.next(count);
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

  updateUnreadCount(userId: number): void {
      this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`).subscribe(
        count => this.unreadCountSubject.next(count)
      );
    }
}
