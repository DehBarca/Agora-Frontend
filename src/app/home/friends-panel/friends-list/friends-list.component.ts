import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { UserService } from '../../../shared/services/user.service';
import { GetFriendsResponse } from '../../../shared/types/get-friends-response';
import { GroupService } from '../../../shared/services/group.service';
import { SocketService } from '../../../shared/services/socket.service'; // Importar
import { Router } from '@angular/router';
import { Group } from '../../../shared/types/group';
import { Subscription } from 'rxjs'; // Importar para limpiar suscripción
import { UserStatus } from '../../../shared/types/user-status';

@Component({
  selector: 'app-friends-list',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatButtonModule, MatTooltipModule],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.scss'
})
export class FriendsListComponent implements OnInit, OnDestroy {
  friends: GetFriendsResponse[] = [];
  private statusSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private socketService: SocketService, // Inyectar
    private router: Router
  ){}

  ngOnInit(): void {
      this.loadFriends();
      
      // Suscribirse a cambios de estado en tiempo real
      this.statusSubscription = this.socketService.onFriendStatusChange().subscribe({
            next: (data: { userId: string; status: UserStatus }) => {
              // Buscar al amigo y actualizar su estado
              const friendIndex = this.friends.findIndex((friend) => friend.friendId._id === data.userId);
              if (friendIndex !== -1) {
                  // Creamos una copia para detectar cambios (inmutabilidad)
                  const updatedFriend = { ...this.friends[friendIndex] };
                  updatedFriend.friendId.status = data.status;
                  this.friends[friendIndex] = updatedFriend;
              }
          }
      });
  }

  ngOnDestroy(): void {
      // Limpiar suscripción para evitar memory leaks
      if (this.statusSubscription) {
          this.statusSubscription.unsubscribe();
      }
  }

  loadFriends() {
    this.userService.getMyFriends().subscribe({
      next:(friendships: GetFriendsResponse[])=> {
        console.log("My friends: ",friendships)
        this.friends = friendships;
      }
    });
  }

  startChat(friendData: GetFriendsResponse, event?: MouseEvent) {
    event?.stopPropagation();

    const friend = friendData.friendId;
    if (!friend._id) return;

    this.groupService.findDirectChatWithUser(friend._id).subscribe({
      next: (existingGroup: Group | null) => {
        if (existingGroup) {
          this.enterChat(existingGroup);
          return;
        }

        this.createNewChat(friend._id!, friend.username);
      },
      error: (err: unknown) => {
        console.error('Error finding existing direct chat', err);
        this.createNewChat(friend._id!, friend.username);
      }
    });
  }

  private createNewChat(friendId: string, username: string) {
    const newGroup: Group = {
        topic: username,
    };

    this.groupService.createGroup(newGroup, [friendId]).subscribe({
        next: (group: Group) => {
          console.log('Chat group created:', group);
          this.enterChat(group);
        },
        error: (err: unknown) => {
          console.error('Error creating chat group:', err);
          alert('No se pudo crear el chat. Intenta de nuevo.');
        }
    });
  }

  private enterChat(group: Group) {
    if(!group._id) {
      console.error('Group ID not available');
      return;
    }
    this.groupService.updateGroupSummary(group);
    console.log('Navigating to:', `/home/${group._id}`);
    this.router.navigateByUrl(`/home/${group._id}`).then(
      (success: boolean) => console.log('Navigation success:', success),
      (error: unknown) => console.error('Navigation error:', error)
    );
  }

  deleteFriend(friendshipId: string, event: Event) {
    event.stopPropagation();
    if(confirm('¿Estás seguro de que quieres eliminar a este amigo?')) {
        this.userService.deleteFriendship(friendshipId).subscribe({
            next: () => {
                this.friends = this.friends.filter(f => f._id !== friendshipId);
            },
          error: (err: unknown) => console.error('Error deleting friend', err)
        });
    }
  }
}