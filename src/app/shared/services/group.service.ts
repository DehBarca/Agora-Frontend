import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Group } from '../types/group';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { GroupMember } from '../types/group-member';
import { TokenService } from './token.service';
import { DeleteGroupResponse } from '../types/delete-group-response';
import { GetGroupMembersResponse } from '../types/get-group-members-response';
import { UserService } from './user.service';
import { User } from '../types/user';

@Injectable({
    providedIn: 'root',
})
export class GroupService {
    private endpnt: string = 'groups/';
    private groupSummary = new BehaviorSubject<Group>({ topic: '' });
    private myGroups = new BehaviorSubject<Group[]>([]);
    myGroups$ = this.myGroups.asObservable();

    constructor(
        private httpClient: HttpClient,
        private tokenService: TokenService,
        private userService: UserService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.tokenService.getToken();
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    private upsertMyGroup(group: Group): void {
        const updatedGroups = this.myGroups.value.some((existingGroup: Group) => existingGroup._id === group._id)
            ? this.myGroups.value.map((existingGroup: Group) =>
                  existingGroup._id === group._id ? group : existingGroup
              )
            : [...this.myGroups.value, group];

        this.myGroups.next(updatedGroups);
    }

    private getGroupIdentityKey(
        group: Group,
        members: GetGroupMembersResponse[] = []
    ): string {
        if (group.communityId || members.length !== 2) {
            return group._id ?? group.topic.trim().toLowerCase();
        }

        const memberIds = members
            .map((member) => member.userId._id ?? member.userId.username)
            .filter((memberId): memberId is string => !!memberId)
            .sort();

        return `dm:${memberIds.join(':')}`;
    }

    updateGroupSummary(changes: Partial<Group>) {
        this.groupSummary.next({
            ...this.groupSummary.value,
            ...changes,
        });
    }
    clearGroupSummary() {
        this.groupSummary.next({ topic: '' }); // Restablece el estado inicial
    }
    getGroupSummary(groupId?: string): Observable<Group> {
        if (groupId && this.groupSummary.value._id !== groupId) {
            const headers = this.getHeaders();
            this.httpClient
                .get<Group>(`${environment.apiUrl}${this.endpnt}${groupId}`, {
                    headers,
                })
                .subscribe({
                    next: (group: Group) => {
                        this.updateGroupSummary(group);
                    },
                });
        }
        return this.groupSummary.asObservable();
    }

    //DMs
    getMyGroups(): Observable<Group[]> {
        const headers = this.getHeaders();
        return this.httpClient
            .get<Group[]>(`${environment.apiUrl}${this.endpnt}my-groups`, {
                headers,
            })
            .pipe(
                switchMap((response: Group[]) => {
                    const groupRequests = response.map((group: Group) => {
                        if (!group._id || group.communityId) {
                            return of({ group, members: [] as GetGroupMembersResponse[] });
                        }

                        return this.getGroupMembers(group._id).pipe(
                            map((members: GetGroupMembersResponse[]) => ({ group, members })),
                            catchError(() =>
                                of({ group, members: [] as GetGroupMembersResponse[] })
                            )
                        );
                    });

                    return groupRequests.length
                        ? forkJoin(groupRequests)
                        : of([] as Array<{
                              group: Group;
                              members: GetGroupMembersResponse[];
                          }>);
                }),
                map((groupsWithMembers: Array<{ group: Group; members: GetGroupMembersResponse[] }>) => {
                    const uniqueGroups = new Map<string, Group>();

                    for (const { group, members } of groupsWithMembers) {
                        const key = this.getGroupIdentityKey(group, members);
                        if (!uniqueGroups.has(key)) {
                            uniqueGroups.set(key, group);
                        }
                    }

                    return Array.from(uniqueGroups.values());
                }),
                tap((response: Group[]) => {
                    this.myGroups.next(response);
                })
            );
    }

    getAllMyGroups(): Observable<Group[]> {
        const headers = this.getHeaders();
        return this.httpClient.get<Group[]>(
            `${environment.apiUrl}${this.endpnt}all-my-groups`,
            { headers }
        );
    }

    // getMyCommunityGroups
    //Lo ponemos en este service para cambiar el observable myGroups
    getMyCommunityGroups(communityId: string): Observable<Group[]> {
        const headers = this.getHeaders();
        return this.httpClient
            .get<Group[]>(
                `${environment.apiUrl}${this.endpnt}my-community-groups/${communityId}`,
                { headers }
            )
            .pipe(tap((response: Group[]) => this.myGroups.next(response)));
    }

    getMyGroupMember(groupId: string): Observable<GroupMember> {
        const headers = this.getHeaders();
        return this.httpClient.get<GroupMember>(
            `${environment.apiUrl}${this.endpnt}my-group-member/${groupId}`,
            { headers }
        );
    }

    getGroupMembers(groupId: string): Observable<GetGroupMembersResponse[]> {
        const headers = this.getHeaders();
        return this.httpClient.get<GetGroupMembersResponse[]>(
            `${environment.apiUrl}${this.endpnt}group-members/${groupId}`,
            { headers }
        );
    }

    createGroup(group: Group, friendIds: string[]): Observable<Group> {
        const headers = this.getHeaders();
        return this.httpClient
            .post<Group>(
                `${environment.apiUrl}${this.endpnt}`,
                { group: group, initialMembersIds: friendIds },
                { headers }
            )
            .pipe(
                tap((response: Group) => {
                    console.log('group:', response);
                    this.upsertMyGroup(response);
                })
            );
    }

    getDirectChatDisplayName(group: Group): Observable<string> {
        if (!group._id || group.communityId) {
            return of(group.topic);
        }

        return this.userService.getMyUser().pipe(
            switchMap((currentUser: User) =>
                this.getGroupMembers(group._id!).pipe(
                    map((members: GetGroupMembersResponse[]) => {
                        const otherMember = members.find((member: GetGroupMembersResponse) => {
                            const memberId = member.userId._id;
                            return memberId !== currentUser._id;
                        });

                        return otherMember?.userId.username ?? group.topic;
                    }),
                    catchError(() => of(group.topic))
                )
            )
        );
    }

    findDirectChatWithUser(friendId: string): Observable<Group | null> {
        return this.userService.getMyUser().pipe(
            switchMap((currentUser: User) =>
                this.getMyGroups().pipe(
                    switchMap((groups: Group[]) => {
                        const directChatChecks = groups.map((group: Group) => {
                            if (!group._id || group.communityId) {
                                return of(null);
                            }

                            return this.getGroupMembers(group._id).pipe(
                                map((members: GetGroupMembersResponse[]) => {
                                    const memberIds = members
                                        .map((member: GetGroupMembersResponse) => member.userId._id ?? '')
                                        .filter((memberId: string) => !!memberId);

                                    const isSamePair =
                                        members.length === 2 &&
                                        memberIds.includes(currentUser._id ?? '') &&
                                        memberIds.includes(friendId);

                                    return isSamePair ? group : null;
                                }),
                                catchError(() => of(null))
                            );
                        });

                        return directChatChecks.length
                            ? forkJoin(directChatChecks)
                            : of([] as Array<Group | null>);
                    }),
                    map((candidateGroups: Array<Group | null>) =>
                        candidateGroups.find((group: Group | null): group is Group => !!group) ?? null
                    )
                )
            )
        );
    }

    addGroupMembers(
        userIds: string[],
        groupId: string
    ): Observable<GroupMember[]> {
        const headers = this.getHeaders();
        return this.httpClient.post<GroupMember[]>(
            `${environment.apiUrl}${this.endpnt}add-groupmembers`,
            { groupId, userIds },
            { headers }
        );
    }

    editGroupImg(formData: FormData, groupId: string): Observable<string> {
        const headers = this.getHeaders();
        return this.httpClient
            .put<string>(
                `${environment.apiUrl}${this.endpnt}edit-group-image/${groupId}`,
                formData,
                { headers }
            )
            .pipe(
                tap((response: string) => {
                    this.updateGroupSummary({ groupImgUrl: response });
                    const updatedGroups = this.myGroups.value.map((group: Group) =>
                        group._id === groupId
                            ? { ...group, groupImgUrl: response }
                            : group
                    );
                    this.myGroups.next(updatedGroups);
                })
            );
    }
    editTopic(topic: string, groupId: string): Observable<string> {
        const headers = this.getHeaders();
        return this.httpClient
            .put<string>(
                `${environment.apiUrl}${this.endpnt}edit-topic/${groupId}`,
                { topic },
                { headers }
            )
            .pipe(
                tap((response: string) => {
                    this.updateGroupSummary({ topic: response });
                    const updatedGroups = this.myGroups.value.map((group: Group) =>
                        group._id === groupId
                            ? { ...group, topic: response }
                            : group
                    );
                    this.myGroups.next(updatedGroups);
                })
            );
    }
    makeGroupAdmin(
        groupMemberId: string,
        groupId: string
    ): Observable<GroupMember> {
        const headers = this.getHeaders();
        return this.httpClient.put<GroupMember>(
            `${environment.apiUrl}${this.endpnt}${groupId}/make-admin/${groupMemberId}`,
            {},
            { headers }
        );
    }

    removeGroupMember(
        groupMemberId: string,
        groupId: string
    ): Observable<GroupMember> {
        const headers = this.getHeaders();
        return this.httpClient.delete<GroupMember>(
            `${environment.apiUrl}${this.endpnt}${groupId}/remove-member/${groupMemberId}`,
            { headers }
        );
    }

    deleteGroup(groupId: string): Observable<DeleteGroupResponse> {
        const headers = this.getHeaders();
        return this.httpClient
            .delete<DeleteGroupResponse>(
                `${environment.apiUrl}${this.endpnt}${groupId}`,
                { headers }
            )
            .pipe(
                tap(() => {
                    const updatedGroups = this.myGroups.value.filter(
                        (g: Group) => g._id !== groupId
                    );
                    this.myGroups.next(updatedGroups);
                    this.clearGroupSummary();
                })
            );
    }

    leaveGroup(groupId: string): Observable<GroupMember> {
        const headers = this.getHeaders();
        return this.httpClient
            .delete<GroupMember>(
                `${environment.apiUrl}${this.endpnt}${groupId}leave-group`,
                { headers }
            )
            .pipe(
                tap(() => {
                    const updatedGroups = this.myGroups.value.filter(
                        (g: Group) => g._id !== groupId
                    );
                    this.myGroups.next(updatedGroups);
                })
            );
    }

    //Funcion de respuesta para cuando nos agregar a un grupo y estamos online (socket)
}
