import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Message } from '../types/message';
import { TokenService } from './token.service';
import { GroupService } from './group.service';
import { UserService } from './user.service';
import { User } from '../types/user';
import { UserStatus } from '../types/user-status'; // Importar enum

import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Group } from '../types/group';
import { Notification } from '../types/notification';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private user: User;
  private socketReady = false;

  constructor(
    private tokenService: TokenService,
    private groupService: GroupService,
    private userService: UserService
  ) {
    this.user = userService.getCleanUser();
  }

  connectWithGroups() {
    this.userService.getMyUser().subscribe({
      next: (user) => {
        this.user = user;
        this.groupService.getAllMyGroups().subscribe({
          next: (allMyGroups: Group[]) => {
            const groupIds = allMyGroups.map((g) => g._id);
            this.socket = io(environment.apiUrl, {
              auth: {
                token: this.tokenService.getToken(),
              },
              query: {
                groupIds: JSON.stringify(groupIds),
                user: JSON.stringify(this.user),
              },
            });
            this.socket.on('connect', () => {
              this.socketReady = true;
              console.log('Socket connected');
            });
          },
        });
      },
    });
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getSocket(): Socket {
    return this.socket;
  }

  // === NUEVO: Manejo de Estado === No se si sea necesario
  emitStatusChange(status: UserStatus) {
    if (this.socket && this.socketReady) {
      this.socket.emit('status-change', { status });
    }
  }

  onFriendStatusChange(): Observable<{ userId: string; status: UserStatus }> {
    return new Observable((observer) => {
      // Esperamos a que el socket esté listo
      const checkSocket = () => {
        if (this.socket && this.socketReady) {
          this.socket.on(
            'friend-status-change',
            (data: { userId: string; status: UserStatus }) => {
              observer.next(data);
            }
          );
        } else {
          setTimeout(checkSocket, 500);
        }
      };
      checkSocket();
    });
  }
  // ==============================

  onMessage(): Observable<Message> {
    return new Observable((observer) => {
      const checkSocket = () => {
        if (this.socket && this.socketReady) {
          this.socket.on('message', (data: Message) => {
            observer.next(data);
          });
        } else {
          setTimeout(checkSocket, 100);
        }
      };
      checkSocket();
    });
  }
  onNotification(): Observable<Notification> {
    return new Observable((observer) => {
      const checkSocket = () => {
        if (this.socket && this.socketReady) {
          this.socket.on('notification', (data: Notification) => {
            observer.next(data);
          });
        } else {
          setTimeout(checkSocket, 100);
        }
      };
      checkSocket();
    });
  }
  onCall(): Observable<Group> {
    return new Observable((observer) => {
      const checkSocket = () => {
        if (this.socket && this.socketReady) {
          this.socket.on('call-starting', (data: { group: Group }) => {
            console.log('🔔 Event call-starting recibido:', data);
            observer.next(data.group);
          });
        } else {
          setTimeout(checkSocket, 100);
        }
      };
      checkSocket();
    });
  }
}
