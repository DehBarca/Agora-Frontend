import { Component } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/types/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrl: './add-friend.component.scss',
  imports: [CommonModule, FormsModule]
})
export class AddFriendComponent {
  searchQuery = '';
  users: User[] = [];

  constructor(private userService: UserService) {}

  onSearch() {
    if (!this.searchQuery.trim()) return;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => { 
        this.users = users;
      },
      error: (err) => console.error('Error al buscar usuarios', err)
    });
  }

  sendFriendRequest(userId: string) {
    this.userService.sendFriendRequest(userId).subscribe({
      next: () => {
        this.searchQuery = '';
        this.users = [];
        alert('Solicitud enviada')},
      error: (err) => alert('Error al enviar solicitud')
    });
  }
}