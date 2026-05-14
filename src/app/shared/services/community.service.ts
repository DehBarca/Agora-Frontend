import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Community } from '../types/community';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';
import { CommunityMember } from '../types/community-member';
import { GetCommunityMembersResponse } from '../types/get-community-members-response';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private endpnt: string = 'communities/';
  private communitySummary = new BehaviorSubject<Community>({
    communityName: '',
  });
  private myCommunities = new BehaviorSubject<Community[]>([]);
  myCommunities$ = this.myCommunities.asObservable();

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService
  ) {}
  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  updateCommunitySummary(changes: Partial<Community>) {
    this.communitySummary.next({
      ...this.communitySummary.value,
      ...changes,
    });
  }
  cleanCommunitySummary(){
    this.communitySummary.next({communityName: ''});
  }
  getCommunitySummary(): Observable<Community> {
    // if (!this.communitySummary.value._id && communityId) {
    //   const headers = this.getHeaders();
    //   this.httpClient
    //     .get<Community>(`${environment.apiUrl}${this.endpnt}${communityId}`, {
    //       headers,
    //     })
    //     .subscribe({
    //       next: (group) => {
    //         this.updateCommunitySummary(group);
    //       },
    //     });
    // }
    return this.communitySummary.asObservable();
  }

  createCommunity(
    community: Community,
    friendIds: string[]
  ): Observable<Community> {
    const headers = this.getHeaders();
    return this.httpClient
      .post<Community>(
        `${environment.apiUrl}${this.endpnt}`,
        { community: community, initialMembersIds: friendIds },
        { headers }
      )
      .pipe(
        tap((response) =>
          this.myCommunities.next([...this.myCommunities.value, response])
        )
      );
  }

  addCommunityMembers(
    userIds: string[],
    communityId: string
  ): Observable<CommunityMember[]> {
    const headers = this.getHeaders();
    return this.httpClient.post<CommunityMember[]>(
      `${environment.apiUrl}${this.endpnt}add-communityMembers`,
      { communityId, userIds },
      { headers }
    );
  }

  getMyCommunities(): Observable<Community[]> {
    const headers = this.getHeaders();
    return this.httpClient
      .get<Community[]>(`${environment.apiUrl}${this.endpnt}my-communities`, {
        headers,
      })
      .pipe(tap((response) => this.myCommunities.next(response)));
  }

  getCommunityMembers(communityId: string): Observable<GetCommunityMembersResponse[]>{
    const headers = this.getHeaders();
    return this.httpClient.get<GetCommunityMembersResponse[]>(`${environment.apiUrl}${this.endpnt}community-members/${communityId}`, {headers});
  }
}
