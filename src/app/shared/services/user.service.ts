import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../types/user';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { Friendship } from '../types/friendship';
import { AcceptfrResponse } from '../types/acceptfr-response';

import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GetFriendsResponse } from '../types/get-friends-response';
import { UserStatus } from '../types/user-status';
import { GetReceivedRequestsResponse } from '../types/get-received-requests-response';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private endpnt: string = 'users/';

    private currentUserSubject = new BehaviorSubject<User>(this.getCleanUser());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private httpClient: HttpClient,
        private tokenService: TokenService
    ) {}

    getCleanUser(): User {
        return {
            username: '',
            email: '',
            profileImgUrl: '',
            status: UserStatus.ONLINE,
        };
    }

    setUser(user: User) {
        this.currentUserSubject.next(user);
    }

    clearUser() {
        this.currentUserSubject.next(this.getCleanUser());
    }

    private getHeaders(): HttpHeaders {
        const token = this.tokenService.getToken();
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    getMyUser(): Observable<User> {
        const currentValue = this.currentUserSubject.value;

        if (currentValue._id) {
            return this.currentUser$;
        }

        const headers = this.getHeaders();

        return this.httpClient
            .get<User>(`${environment.apiUrl}${this.endpnt}my-user`, {
                headers,
            })
            .pipe(
                tap((user) => {
                    const userStatusSS = sessionStorage.getItem('userStatus');
                    if (!userStatusSS) {
                        sessionStorage.setItem('userStatus', UserStatus.ONLINE);
                        user.status = UserStatus.ONLINE;
                    } else if (userStatusSS !== UserStatus.OFFLINE) {
                        user.status = userStatusSS;
                    }
                    this.currentUserSubject.next(user);
                })
            );
    }

    getAllUsers(): Observable<User[]> {
        const headers = this.getHeaders();

        return this.httpClient.get<User[]>(
            `${environment.apiUrl}${this.endpnt}`,
            {
                headers,
            }
        );
    }

    editProfileImg(formData: FormData): Observable<string> {
        const headers = this.getHeaders();

        return this.httpClient
            .put<string>(
                `${environment.apiUrl}${this.endpnt}edit-profile-image`,
                formData,
                { headers }
            )
            .pipe(
                tap((newUrl) => {
                    const currentUser = this.currentUserSubject.value;
                    this.currentUserSubject.next({
                        ...currentUser,
                        profileImgUrl: newUrl,
                    });
                })
            );
    }

    changeUserStatus(status: UserStatus): Observable<User> {
        const headers = this.getHeaders();

        return this.httpClient
            .put<User>(
                `${environment.apiUrl}${this.endpnt}change-user-status/${status}`,
                {},
                { headers }
            )
            .pipe(
                tap(() => {
                    const currentUser = this.currentUserSubject.value;
                    this.currentUserSubject.next({
                        ...currentUser,
                        status: status,
                    });
                    sessionStorage.setItem('userStatus', status);
                })
            );
    }

    editUsername(username: string): Observable<User> {
        const headers = this.getHeaders();

        return this.httpClient
            .put<User>(
                `${environment.apiUrl}${this.endpnt}edit-username`,
                { username: username },
                { headers }
            )
            .pipe(
                tap(() => {
                    const currentUser = this.currentUserSubject.value;
                    this.currentUserSubject.next({
                        ...currentUser,
                        username: username,
                    });
                })
            );
    }

    getRequestsReceived(): Observable<GetReceivedRequestsResponse[]> {
        const headers = this.getHeaders();

        return this.httpClient.get<GetReceivedRequestsResponse[]>(
            `${environment.apiUrl}${this.endpnt}received-requests`,
            { headers }
        );
    }

    searchUsers(searchQuery: string): Observable<User[]> {
        const headers = this.getHeaders();

        return this.httpClient.get<User[]>(
            `${environment.apiUrl}${this.endpnt}search?username=${searchQuery}`,
            { headers }
        );
    }

    sendFriendRequest(friendId: string): Observable<Friendship> {
        const headers = this.getHeaders();

        return this.httpClient.post<Friendship>(
            `${environment.apiUrl}${this.endpnt}friend-request`,
            { friendId },
            { headers }
        );
    }

    acceptFriendRequest(friendshipId: string): Observable<AcceptfrResponse> {
        const headers = this.getHeaders();

        return this.httpClient.put<AcceptfrResponse>(
            `${environment.apiUrl}${this.endpnt}accept-friend`,
            { friendshipId },
            { headers }
        );
    }

    getMyFriends(): Observable<GetFriendsResponse[]> {
        const headers = this.getHeaders();

        return this.httpClient.get<GetFriendsResponse[]>(
            `${environment.apiUrl}${this.endpnt}friends`,
            { headers }
        );
    }

    deleteFriendship(friendshipId: string): Observable<Friendship> {
        const headers = this.getHeaders();

        return this.httpClient.delete<Friendship>(
            `${environment.apiUrl}${this.endpnt}delete-friendship`,
            { headers, body: { friendshipId } }
        );
    }
}
