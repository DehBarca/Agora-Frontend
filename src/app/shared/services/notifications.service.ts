import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notification as INotification } from '../types/notification';

@Injectable({
    providedIn: 'root',
})
export class NotificationsService {
    endpnt: string = 'notifications/';
    private currentNotificationsSubject = new BehaviorSubject<INotification[]>(
        []
    );
    currentNotifications$ = this.currentNotificationsSubject.asObservable();
    constructor(
        private httpClient: HttpClient,
        private tokenService: TokenService
    ) {}

    getHeaders(): HttpHeaders {
        const token = this.tokenService.getToken();
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    clearNotifications(){
        this.currentNotificationsSubject.next([]);
    }
    getMyUnseenNotifications(): Observable<INotification[]> {
        const currentValue = this.currentNotificationsSubject.value;

        if (currentValue.length) {
            return this.currentNotifications$;
        }
        const headers = this.getHeaders();
        return this.httpClient
            .get<INotification[]>(
                `${environment.apiUrl}${this.endpnt}my-unseen`,
                { headers }
            )
            .pipe(
                tap((notifications) => {
                    this.currentNotificationsSubject.next(notifications);
                })
            );
    }

    getAllMyNotifications(): Observable<INotification[]> {
        const headers = this.getHeaders();
        return this.httpClient.get<INotification[]>(
            `${environment.apiUrl}${this.endpnt}all`,
            { headers }
        );
    }

    updateToSeen(notifications: INotification[]): Observable<INotification[]> {
        const headers = this.getHeaders();
        const notificationsIds = notifications.map((n) => n._id);
        return this.httpClient.put<INotification[]>(
            `${environment.apiUrl}${this.endpnt}seen`,
            { notificationsIds },
            { headers }
        ).pipe(tap(()=> {
            this.clearNotifications();
        }));
    }
}
