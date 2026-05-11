import { Component } from '@angular/core';

import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-friends-panel',
  imports: [HeaderComponent, RouterOutlet],

  templateUrl: './friends-panel.component.html',
  styleUrls: ['./friends-panel.component.scss'] // 👈 plural
})
export class FriendsPanelComponent {}
