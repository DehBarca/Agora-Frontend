import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { GetFriendsResponse } from '../../../types/get-friends-response';
import { User } from '../../../types/user';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../../services/group.service';
import { ModalsService } from '../../../services/modals.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GetGroupMembersResponse } from '../../../types/get-group-members-response';

@Component({
  selector: 'app-add-members-modal',
  standalone: true,
  imports: [MatCheckboxModule],
  templateUrl: './add-members-modal.component.html',
  styleUrl: './add-members-modal.component.scss'
})
export class AddMembersModalComponent implements OnInit{
  users: User[] = [];
  selectedUsers: Set<string> = new Set();
  isLoading: boolean = false;
  isSuccess: boolean = false;
  @Input() groupId!:string;
  @Input() groupMembers!: GetGroupMembersResponse[];

  @Output() newGroupMembers = new EventEmitter<void>;

  constructor(private userService: UserService, private groupService: GroupService, private modalsServices: ModalsService){}

  ngOnInit(): void {
      this.userService.getMyFriends().subscribe({
        next: (response: GetFriendsResponse[]) => {
          const users = response.map(friendship => friendship.friendId);
          const groupMembersIds = this.groupMembers.map(member => member.userId._id);
          this.users = users.filter(user => !groupMembersIds.includes(user._id))
        }
      })
  }

  onUserClicked(userId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }
  addMembers(event: MouseEvent): void {
    event.stopPropagation();
    this.isLoading = true;
    const userIds: string[] = [...this.selectedUsers];
    this.groupService.addGroupMembers(userIds, this.groupId).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        setTimeout(()=> {
          this.isSuccess = false;
        }, 1500)
        this.newGroupMembers.emit();
        this.closeModal();
      }
    })
  }

  closeModal(){
    this.modalsServices.closeAddMembers();
  };

}
