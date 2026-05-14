import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GroupService } from '../../../services/group.service';
import { CommonModule } from '@angular/common';
import { GetGroupMembersResponse } from '../../../types/get-group-members-response';

@Component({
  selector: 'app-member-group-options-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-group-options-modal.component.html',
  styleUrl: './member-group-options-modal.component.scss',
})
export class MemberGroupOptionsModalComponent {
  @Input() position!: { x: number; y: number };
  @Input() member!: GetGroupMembersResponse;
  @Input() groupId!: string;
  @Output() close = new EventEmitter<void|'removed'|'admin'>;

  constructor(private groupService: GroupService){}

  makeAdmin(){
    this.groupService.makeGroupAdmin(this.member._id!, this.groupId).subscribe({
      next: () => {
        this.close.emit('admin')
      },
      error: (e) => {
        alert('Error making user admin' + e)
      }
    })
  }

  removeMember(){
    this.groupService.removeGroupMember(this.member._id!, this.groupId).subscribe({
      next:() => {
        this.close.emit('removed')
      },
      error: (e) =>{
        alert('Error removing member' + e)
      }
    })
  }
}
