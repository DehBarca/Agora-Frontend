import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { Group } from '../../shared/types/group';
import { GroupService } from '../../shared/services/group.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { catchError, filter, forkJoin, map, of } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { GetGroupMembersResponse } from '../../shared/types/get-group-members-response';

@Component({
  selector: 'app-group-nav',
  imports: [HeaderComponent],
  templateUrl: './group-nav.component.html',
  styleUrl: './group-nav.component.scss',
})
export class GroupNavComponent implements OnInit {
  groups: Group[] = [];
  communityId: string = '';
  groupLabels: Record<string, string> = {};
  private currentUserId: string = '';
  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.userService.getMyUser().subscribe((user) => {
      this.currentUserId = user._id ?? '';
      this.updateGroupLabels(this.groups);
    });

    this.groupService.myGroups$.subscribe((groups) => {
      this.groups = groups;
      this.updateGroupLabels(groups);
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateGroupsBasedOnRoute();
      });

    this.updateGroupsBasedOnRoute();
  }

  getGroupDisplayName(group: Group): string {
    return this.groupLabels[group._id ?? group.topic] ?? group.topic;
  }

  private updateGroupLabels(groups: Group[]): void {
    const fallbackLabels = groups.reduce(
      (labels: Record<string, string>, group: Group) => {
        labels[group._id ?? group.topic] = group.topic;
        return labels;
      },
      {}
    );

    const directGroups = groups.filter(
      (group: Group) => !group.communityId && !!group._id
    );

    if (!directGroups.length || !this.currentUserId) {
      this.groupLabels = fallbackLabels;
      return;
    }

    forkJoin(
      directGroups.map((group: Group) =>
        this.groupService.getGroupMembers(group._id!).pipe(
          map((members: GetGroupMembersResponse[]) => {
            // Only show other user's name for 1-on-1 chats (exactly 2 members)
            if (members.length === 2) {
              const otherMember = members.find(
                (member: GetGroupMembersResponse) =>
                  (member.userId._id ?? '') !== this.currentUserId
              );
              return {
                groupId: group._id!,
                label: otherMember?.userId.username ?? group.topic,
              };
            }
            // For groups with more than 2 members, always show the group topic
            return {
              groupId: group._id!,
              label: group.topic,
            };
          }),
          catchError(() => of({ groupId: group._id!, label: group.topic }))
        )
      )
    ).subscribe((labels) => {
      const nextLabels = { ...fallbackLabels };

      labels.forEach(({ groupId, label }) => {
        nextLabels[groupId] = label;
      });

      this.groupLabels = nextLabels;
    });
  }

  private updateGroupsBasedOnRoute(): void {
    let route = this.route.root;
    let communityId: string | null = null;

    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot.paramMap.has('communityId')) {
        communityId = route.snapshot.paramMap.get('communityId');
      }
    }

    console.log('communityId detectado:', communityId);

    if (communityId && communityId !== this.communityId) {
      this.communityId = communityId;
      this.groupService.getMyCommunityGroups(communityId).subscribe();
    } else if (!communityId && this.communityId) {
      this.communityId = '';
      this.groupService.getMyGroups().subscribe();
    } else if (!communityId && !this.communityId) {
      this.groupService.getMyGroups().subscribe();
    }
  }

  selectGroup(group: Group) {
    if (!group.groupImgUrl) group.groupImgUrl = '';
    this.groupService.updateGroupSummary(group);

    if (this.communityId) {
      this.router.navigateByUrl(
        `/home/community/${this.communityId}/group/${group._id}`
      );
    } else {
      this.router.navigateByUrl(`/home/${group._id}`);
    }
  }
}
