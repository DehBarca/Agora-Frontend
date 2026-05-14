import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Message } from '../../../shared/types/message';
import { MessageService } from '../../../shared/services/message.service';
import { SocketService } from '../../../shared/services/socket.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, MatIconModule], 
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, AfterViewInit {
  messages: Message[] = [];
  groupId: string = '';
  currentUser: string = '';
  
  @ViewChild('lastRef') lastRef!: ElementRef<HTMLLIElement>;

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  scrollToBottom() {
    requestAnimationFrame(() => {
      if (this.lastRef) {
        this.lastRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  ngOnInit(): void {
    this.userService.getMyUser().subscribe((user) => {
      this.currentUser = user.username;
    });

    this.route.paramMap.subscribe({
      next: (params) => {
        const groupId = params.get('id')!;
        this.groupId = groupId;
        this.messageService.getGroupMessages(groupId).subscribe({
          next: (response: Message[]) => {
            this.messages = response;
            setTimeout(() => this.scrollToBottom(), 100);
          },
        });
      },
    });

    this.socketService.onMessage().subscribe({
      next: (response) => {
        if (response.groupId === this.groupId) {
          this.messages.push(response);
            this.scrollToBottom()          
        }
      },
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }
}