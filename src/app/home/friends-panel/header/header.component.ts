import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(private router: Router) {}

  navToList() {
    this.router.navigateByUrl('/home/friends');
  }
  navToAdd() {
    this.router.navigateByUrl('/home/friends/add-friend');
  }
  navToPending() {
    this.router.navigateByUrl('/home/friends/pending');
  }

  isAddFriendRoute(): boolean {
    return this.router.url.includes('/add-friend');
  }
}
