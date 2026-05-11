import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { InputComponent } from './input/input.component';
import { MessagesComponent } from './messages/messages.component';
import { ModalsService } from '../../shared/services/modals.service';
import { GroupInfoModalComponent } from '../../shared/components/modals/group-info-modal/group-info-modal.component';

@Component({
  selector: 'app-chat',
  imports: [HeaderComponent, InputComponent, MessagesComponent, GroupInfoModalComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  isGroupInfoOpen = false;
  constructor(private modalsService: ModalsService){}

  ngOnInit(): void {
    this.modalsService.openGroupInfo$.subscribe(
      (val) => (this.isGroupInfoOpen = val)
    );

  }
}
