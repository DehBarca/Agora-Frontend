import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../shared/services/group.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalsService } from '../../../shared/services/modals.service';
import { Group } from '../../../shared/types/group';
import { GroupMember } from '../../../shared/types/group-member';

@Component({
  selector: 'app-header',
  imports: [MatIconButton, MatIcon, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  group: Group = { topic: '' };
  imageFile: File | null = null;

  hoverTopic: boolean = false;
  editingTopic: boolean = false;
  newTopic: string = '';

  isTopicLoading = false;
  isTopicSuccess = false;

  myGroupMember: GroupMember = {} as GroupMember;
  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
    private modalsService: ModalsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');
    this.groupService.getGroupSummary(groupId!).subscribe((group) => {
      this.group = group;
      if (group._id) {
        this.groupService.getMyGroupMember(group._id).subscribe({
          next: (response: GroupMember) => {
            this.myGroupMember = response;
          },
        });
      }
    });
  }

  deleteChat() {
    if (
      confirm(
        '¿Estás seguro de que quieres borrar este chat? Esta acción no se puede deshacer.'
      )
    ) {
      this.groupService.deleteGroup(this.group._id!).subscribe({
        next: () => {
          // Redirigir a home o friends
          this.router.navigate(['/home/']);
        },
        error: (err) => console.error('Error deleting chat', err),
      });
    }
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
  openGroupInfo() {
    this.modalsService.openGroupInfo();
  }

  enableTopicEdit() {
    this.editingTopic = true;
    this.newTopic = this.group.topic;
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
          console.log('Error al editar la imagen del grupo', e);
        },
      });
    } else {
      this.editingTopic = false;
    }
  }

  startGroupCall(){
    this.modalsService.openCall();
  }
}
