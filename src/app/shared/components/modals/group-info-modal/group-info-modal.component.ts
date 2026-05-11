import { Component, OnInit } from '@angular/core';
import { GetGroupMembersResponse } from '../../../types/get-group-members-response';
import { ModalsService } from '../../../services/modals.service';
import { GroupService } from '../../../services/group.service';
import { ActivatedRoute } from '@angular/router';
import { Group } from '../../../types/group';
import { AddMembersModalComponent } from '../add-members-modal/add-members-modal.component';
import { GroupMember } from '../../../types/group-member';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MemberGroupOptionsModalComponent } from '../member-group-options-modal/member-group-options-modal.component';

@Component({
  selector: 'app-group-info-modal',
  imports: [
    AddMembersModalComponent,
    FormsModule,
    MatIcon,
    MemberGroupOptionsModalComponent,
  ],
  standalone: true,
  templateUrl: './group-info-modal.component.html',
  styleUrl: './group-info-modal.component.scss',
})
export class GroupInfoModalComponent implements OnInit {
  groupMembers: GetGroupMembersResponse[] = [];
  group: Group = { topic: '' };
  groupId: string = '';
  isAddMembersOpen: boolean = false;
  isMemberGroupOptionsOpen: boolean = false;

  imageFile: File | null = null;

  hoverTopic: boolean = false;
  editingTopic: boolean = false;
  newTopic: string = '';

  isTopicLoading = false;
  isTopicSuccess = false;

  myGroupMember: GroupMember = {} as GroupMember;

  memberOptionsPosition = { x: 0, y: 0 };
  selectedMember: GetGroupMembersResponse | null = null;
  constructor(
    private modalsServices: ModalsService,
    private groupService: GroupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    this.groupService.getGroupMembers(this.groupId!).subscribe({
      next: (response) => {
        this.groupMembers = response;
      },
    });

    this.groupService.getGroupSummary().subscribe((group) => {
      this.group = group;
      this.groupService.getMyGroupMember(this.group._id!).subscribe({
        next: (response: GroupMember) => {
          this.myGroupMember = response;
        },
      });
    });

    this.modalsServices.openAddMembers$.subscribe((val) => {
      this.isAddMembersOpen = val;
    });
  }
  enableTopicEdit() {
    this.editingTopic = true;
    this.newTopic = this.group.topic;
  }
  editGroupImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      const pastImgUrl = this.group.groupImgUrl;
      this.group.groupImgUrl = URL.createObjectURL(this.imageFile);
      const formData = new FormData();
      formData.append('image', this.imageFile);
      const groupId = this.route.snapshot.paramMap.get('id');

      this.groupService.editGroupImg(formData, groupId!).subscribe({
        next: (newImageUrl) => {
          this.groupService.updateGroupSummary({ groupImgUrl: newImageUrl });
          this.group.groupImgUrl = newImageUrl;
        },
        error: (e) => {
          alert('Error al editar la imagen del grupo');
          this.group.groupImgUrl = pastImgUrl;
          console.log('Error al editar la imagen del grupo', e);
        },
      });
    }
  }
  submitTopicEdit() {
    if (this.newTopic && this.newTopic !== this.group.topic) {
      this.isTopicLoading = true;
      this.editingTopic = false;
      const pastTopic = this.group.topic;
      this.group.topic = this.newTopic;
      const groupId = this.route.snapshot.paramMap.get('id');
      this.groupService.editTopic(this.newTopic, groupId!).subscribe({
        next: () => {
          this.isTopicLoading = false;
          this.isTopicSuccess = true;
          setTimeout(() => {
            this.isTopicSuccess = false;
          }, 1500);
        },
        error: (e) => {
          alert('No se pudo editar el topic');
          this.isTopicLoading = false;
          this.group.topic = pastTopic;
          console.error('Error al editar la imagen del grupo', e);
        },
      });
    } else {
      this.editingTopic = false;
    }
  }

  closeModal(): void {
    this.modalsServices.closeGroupInfo();
  }

  openAddMembers(event: MouseEvent): void {
    event.stopPropagation();
    this.modalsServices.openAddMembers();
  }
  onNewGroupMembers(): void {
    this.groupService.getGroupMembers(this.groupId).subscribe({
      next: (response) => {
        this.groupMembers = response;
      },
    });
  }

  openMemberOptions(event: MouseEvent, member: GetGroupMembersResponse) {
    this.memberOptionsPosition = { x: event.clientX, y: event.clientY };
    this.selectedMember = member;
    this.isMemberGroupOptionsOpen = true;
  }
  closeMemberOptions(result: 'removed' | 'admin' | void) {
    this.isMemberGroupOptionsOpen = false;
    console.log(result)
    if (result === 'removed') {
      alert(`${this.selectedMember!.userId.username} has been removed from group`)
      this.onNewGroupMembers();
    }
    if (result === 'admin') {
      // Actualiza la lista, muestra mensaje, etc.
      alert(`${this.selectedMember!.userId.username} now is admin`)
      this.onNewGroupMembers();
    }
  }
}
