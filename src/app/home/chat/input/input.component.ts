import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService } from '../../../shared/services/message.service';
import { Message } from '../../../shared/types/message';
import { UserService } from '../../../shared/services/user.service';
import { EventsService } from '../../../shared/services/events.service';
import { MessageType } from '../../../shared/types/message-type';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/types/user';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'; // Importación vital
import { CreateEventModalComponent } from '../../../shared/components/modals/create-event-modal/create-event-modal.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, CreateEventModalComponent], // Agregado aquí
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements OnInit {
  message: string = '';
  user: User;
  groupId: string = '';

  imageFile: File | null = null;
  imagePreview: string | null = null;
  
  showEventModal = false;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private eventsService: EventsService,
    private route: ActivatedRoute
  ) {
    this.user = this.userService.getCleanUser();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const groupId = params.get('id')!;
        this.groupId = groupId;
      },
    });
    this.userService.getMyUser().subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }

  handleImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      this.imagePreview = URL.createObjectURL(this.imageFile);
    }
  }
  removeImage() {
    this.imageFile = null;
    this.imagePreview = null;
  }

  openEventModal() {
    this.showEventModal = true;
  }

  closeEventModal() {
    this.showEventModal = false;
  }

  handleCreateEvent(eventData: {title: string, date: string}) {
    // 1. Guardar evento
    this.eventsService.createEventFromChat(eventData.title, eventData.date, this.user.username);

    // 2. Enviar mensaje
    const message: Message = {
        username: this.user.username,
        groupId: this.groupId,
        userId: this.user._id!,
        type: MessageType.EVENT,
        text: `Evento creado: ${eventData.title}`,
        eventData: {
            title: eventData.title,
            date: eventData.date,
            participants: [this.user.username]
        }
    };

    this.messageService.sendMessage(message).subscribe({
        error: (err) => console.error('Error enviando evento', err)
    });
  }

  handleSubmit() {
    if (!this.message.trim() && !this.imageFile) return;

    if (this.imageFile) {
      const formData = new FormData();
      formData.append('groupId', this.groupId);
      formData.append('username', this.user.username);
      formData.append('image', this.imageFile);
      formData.append('text', this.message || '');

      this.messageService.sendImageMessage(formData).subscribe({
        next: () => {
          this.message = '';
          this.removeImage();
        },
        error: (err) => console.error('Error sending image:', err),
      });
    } else {
      const messageData: Message = {
        username: this.user.username,
        groupId: this.groupId,
        userId: this.user._id!,
        type: MessageType.TEXT,
        text: this.message,
      };

      this.messageService.sendMessage(messageData).subscribe({
        next: () => (this.message = ''),
        error: (err) => console.error('Error sending message:', err),
      });
    }
  }

  @ViewChild('messageInput') messageInput!: ElementRef;
}