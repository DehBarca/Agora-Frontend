import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SocialAuthService } from '@abacritt/angularx-social-login';

import { TokenService } from '../../shared/services/token.service';
import { ModalsService } from '../../shared/services/modals.service';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/types/user';
import { NotificationsService } from '../../shared/services/notifications.service';
import { Notification as INotification } from '../../shared/types/notification';
import { NotificationType } from '../../shared/types/notification-type';
import { MessageType } from '../../shared/types/message-type';
@Component({
    selector: 'app-header',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
    NotificationType = NotificationType;
    MessageType = MessageType;
    user: User;
    isSettingsOpen = false;
    isNotificationsOpen = false;

    notifications: INotification[] = [];
    constructor(
        private modalsService: ModalsService,
        private userService: UserService,
        private tokenService: TokenService,
        private router: Router,
        private googleAuthService: SocialAuthService,
        private notificationsService: NotificationsService
    ) {
        this.user = this.userService.getCleanUser();
    }

    ngOnInit(): void {
        this.userService.currentUser$.subscribe((user) => {
            this.user = user;
        });
        this.notificationsService.currentNotifications$.subscribe(
            (notifications: INotification[]) => {
                this.notifications = notifications;
            }
        );
        this.notificationsService
            .getMyUnseenNotifications()
            .subscribe(() => {});
    }
    markAsRead() {
        this.notificationsService.updateToSeen(this.notifications).subscribe();
    }

    toggleNotifications() {
        this.isNotificationsOpen = !this.isNotificationsOpen;
        if (this.isNotificationsOpen) this.isSettingsOpen = false;
    }
    closeNotifications() {
        this.isNotificationsOpen = false;
    }

    handleLogout(): void {
        this.tokenService.logout();
        this.userService.clearUser();
        try {
            this.googleAuthService.signOut();
        } catch (e) {
            console.log('Google session already closed or not active');
        }

        this.router.navigateByUrl('/login');
        this.closeSettings();
    }

    handleSettingClick(option: string) {
        console.log('Navegar a:', option);
        this.closeSettings();
        alert(`La sección ${option} estará disponible pronto.`);
    }

    openCalendarModal() {
        this.modalsService.openCalendar();
    }
    openMyuserModal() {
        this.modalsService.openMyUser();
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
        if (this.isSettingsOpen) this.isNotificationsOpen = false;
    }
    closeSettings() {
        this.isSettingsOpen = false;
    }
}
