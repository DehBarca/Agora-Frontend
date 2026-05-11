import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { ModalsService } from '../../../services/modals.service';
import { UserService } from '../../../services/user.service';
import { TokenService } from '../../../services/token.service';
import { SocketService } from '../../../services/socket.service'; // Importar SocketService

import { User } from '../../../types/user';
import { UserStatus } from '../../../types/user-status';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-myuser-modal',
  imports: [MatButtonModule, MatIcon, CommonModule, FormsModule],
  templateUrl: './myuser-modal.component.html',
  styleUrl: './myuser-modal.component.scss',
})
export class MyuserModalComponent implements OnInit {
  UserStatus = UserStatus;
  user: User;
  imageFile: File | null = null;

  editingUsername = false;
  hoverUsername = false;
  newUsername = '';

  isUsernameLoading = false;
  isUsernameSuccess = false;
  
  constructor(
    private modalService: ModalsService,
    private userService: UserService,
    private socketService: SocketService, // Inyectar
    private router: Router,
    private tokenService: TokenService,
    private googleAuthService: SocialAuthService
  ) {
    this.user = this.userService.getCleanUser();
  }

  ngOnInit(): void {
    this.userService.getMyUser().subscribe((user) => {
      this.user = user;
    });
  }

  closeModal(): void {
    this.modalService.closeMyUser();
  }

  setStatus(status: UserStatus) {
    // 1. Actualizar en Backend y Localmente (UserService maneja ambos)
    this.userService.changeUserStatus(status).subscribe(() => {
        // 2. Avisar a los amigos por Socket
        this.socketService.emitStatusChange(status);
    });
    
    // Optimista: Actualizar la vista inmediatamente
    this.user.status = status;
  }

  editProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      this.user.profileImgUrl = URL.createObjectURL(this.imageFile);

      const formData = new FormData();
      formData.append('image', this.imageFile);
      this.userService.editProfileImg(formData).subscribe({
        next: (newProfileImgUrl) => {
          this.user.profileImgUrl = newProfileImgUrl;
        },
      });
    }
  }

  handleLogout(): void {
    this.tokenService.logout();
    sessionStorage.removeItem('userStatus');
    this.userService.clearUser();
    this.socketService.disconnect(); // Desconectar socket
    try {
        this.googleAuthService.signOut();
    } catch(e) {}
    
    this.router.navigateByUrl('/login');
    this.closeModal();
  }

  enableUsernameEdit() {
    this.editingUsername = true;
    this.newUsername = this.user.username;
  }

  submitUsernameEdit() {
    if (this.newUsername && this.newUsername !== this.user.username) {
      this.isUsernameLoading = true;
      this.isUsernameSuccess = false;
      this.editingUsername = false;
      const pastUsername = this.user.username;
      this.user.username = this.newUsername;
      this.userService.editUsername(this.newUsername).subscribe({
        next: () => {
          this.isUsernameLoading = false;
          this.isUsernameSuccess = true;
          setTimeout(() => (this.isUsernameSuccess = false), 1500);
        },
        error: () => {
          alert('Error changing username');
          this.user.username = pastUsername;
          this.isUsernameLoading = false;
          this.isUsernameSuccess = false;
        },
      });
    } else {
      this.editingUsername = false;
    }
  }
}