import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

import { GroupService } from '../../../services/group.service';
import { UserService } from '../../../services/user.service';
import { Group } from '../../../types/group';
import { ModalsService } from '../../../services/modals.service';
import { GetFriendsResponse } from '../../../types/get-friends-response';
import { CommunityService } from '../../../services/community.service';
import { User } from '../../../types/user';
import { GetCommunityMembersResponse } from '../../../types/get-community-members-response';

interface FriendshipSelectable extends User {
  selected?: boolean;
}

@Component({
  selector: 'app-create-group-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './create-group-modal.component.html',
  styleUrl: './create-group-modal.component.scss',
})
export class CreateGroupModalComponent implements OnInit {
  topic: string = '';
  selectedFriends: Set<string> = new Set();
  friends: FriendshipSelectable[] = []; //Hay que cambiarle el nombre porque al crear una community no necesariamente son friends
  communityId: string | undefined;
  friendAvatarImg = 'https://placehold.co/40x40/533483/ffffff?text=A';

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private modalsService: ModalsService,
    private communityService: CommunityService
  ) {}

  ngOnInit(): void {
    this.communityService.getCommunitySummary().subscribe((community) => {
      if (community._id) {
        this.communityId = community._id;
        this.communityService.getCommunityMembers(community._id).subscribe({
          next: (communityMembers: GetCommunityMembersResponse[]) => {
            this.friends = communityMembers.map((communityMember) => ({
              ...communityMember.userId,
              selected: false,
            }));
          },
        });
      } else {
        this.userService.getMyFriends().subscribe({
          next: (friendships: GetFriendsResponse[]) => {
            this.friends = friendships.map((f) => ({
              ...f.friendId,
              selected: false,
            }));
          },
        });
      }
    });
  }
  closeModal(): void {
    this.modalsService.closeCreateGroup();
  }

  onFriendSelected(friendId: string): void {
    if (this.selectedFriends.has(friendId)) {
      this.selectedFriends.delete(friendId);
    } else {
      this.selectedFriends.add(friendId);
    }
  }

  createGroup(): void {
      const group: Group = {
        topic: this.topic,
      };
      if (this.communityId) {
        group.communityId = this.communityId;
      }
      const friendIds: string[] = [...this.selectedFriends];
      this.groupService.createGroup(group, friendIds).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (err) => {
          console.log('Error creating group:' + err);
        },
      });
    
  }
}
