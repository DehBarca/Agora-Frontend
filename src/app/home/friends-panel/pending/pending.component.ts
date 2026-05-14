import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { GetReceivedRequestsResponse } from '../../../shared/types/get-received-requests-response';

@Component({
  selector: 'app-pending',
  imports: [],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.scss',
})
export class PendingComponent implements OnInit {
  friendRequests: GetReceivedRequestsResponse[] = [];
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getRequestsReceived().subscribe({
      next: (fr: GetReceivedRequestsResponse[]) => {
        this.friendRequests = fr;
      },
    });
  }

  acceptFriendRequest(friendId: string) {
    this.userService.acceptFriendRequest(friendId).subscribe({
      next: () => {
        const index = this.friendRequests.findIndex(
          (fr) => fr._id === friendId
        );
        if (index !== -1) {
          this.friendRequests.splice(index, 1);
        }

        alert('Friend Request accepted');
      },
      error: (err) => {},
    });
  }
}
