import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../services/user.service';
import { ModalsService } from '../../../services/modals.service';
import { GetFriendsResponse } from '../../../types/get-friends-response';
import { CommunityService } from '../../../services/community.service';
import { Community } from '../../../types/community';

interface FriendshipSelectable extends GetFriendsResponse {
  selected?: boolean;
}

@Component({
  selector: 'app-create-community-modal',
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
  templateUrl: './create-community-modal.component.html',
  styleUrl: './create-community-modal.component.scss',
})
export class CreateCommunityModalComponent implements OnInit {
  communityName: string = '';
  selectedFriends: Set<string> = new Set();
  friends: FriendshipSelectable[] = [];
  friendAvatarImg = 'https://placehold.co/40x40/533483/ffffff?text=A';
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
    private modalsService: ModalsService
  ) {}

  ngOnInit(): void {
      this.userService.getMyFriends().subscribe({
        next:(friendships: GetFriendsResponse[])=> {
          this.friends = friendships.map((f) => ({ ...f, selected: false }));
        }
      })
  }
  closeModal(): void {
    this.modalsService.closeCreateCommunity();
  }

  onFriendSelected(friendId: string): void {
    if (this.selectedFriends.has(friendId)) {
      this.selectedFriends.delete(friendId);
    } else {
      this.selectedFriends.add(friendId);
    }
  }

  createCommunity(): void {
    this.errorMessage = null;
    
    // Validation: community name is required
    if (!this.communityName || this.communityName.trim().length === 0) {
      this.errorMessage = 'El nombre de la comunidad es requerido';
      return;
    }

    this.isLoading = true;
    const community: Community = {
      communityName: this.communityName.trim(),
    };
    const friendIds: string[] = [...this.selectedFriends];
    
    this.communityService.createCommunity(community, friendIds).subscribe({
      next: () => {
        console.log('✓ Community created successfully');
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating community:', err);
        this.errorMessage = err.error?.error || 'No se pudo crear la comunidad. Intenta de nuevo.';
      },
    });
  }
}
