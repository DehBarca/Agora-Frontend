import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './home/chat/chat.component';
import { FriendsPanelComponent } from './home/friends-panel/friends-panel.component';
import { AddFriendComponent } from './home/friends-panel/add-friend/add-friend.component';
import { PendingComponent } from './home/friends-panel/pending/pending.component';
import { FriendsListComponent } from './home/friends-panel/friends-list/friends-list.component';

import { authGuard } from './shared/guards/auth.guard';

import { RegisterComponent } from './auth/register/register.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'verify-email',
        loadComponent: () =>
            import('./auth/verify-email/verify-email.component').then(
                (m) => m.VerifyEmailComponent
            ),
    },
    {
        path: 'forgot-password',
        loadComponent: () =>
            import('./auth/forgot-password/forgot-password.component').then(
                (m) => m.ForgotPasswordComponent
            ),
    },
    {
        path: 'reset-password',
        loadComponent: () =>
            import('./auth/reset-password/reset-password.component').then(
                (m) => m.ResetPasswordComponent
            ),
    },
    {
        path: 'home',
        loadComponent: () =>
            import('./home/home.component').then((m) => m.HomeComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'friends',
                loadComponent: () =>
                    import('./home/friends-panel/friends-panel.component').then(
                        (m) => m.FriendsPanelComponent
                    ),
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './home/friends-panel/friends-list/friends-list.component'
                            ).then((m) => m.FriendsListComponent),
                    },
                    {
                        path: 'add-friend',
                        loadComponent: () =>
                            import(
                                './home/friends-panel/add-friend/add-friend.component'
                            ).then((m) => m.AddFriendComponent),
                    },
                    {
                        path: 'pending',
                        loadComponent: () =>
                            import(
                                './home/friends-panel/pending/pending.component'
                            ).then((m) => m.PendingComponent),
                    },
                ],
            },
            {
                path: 'community/:communityId',
                children: [
                    {
                        path: 'group/:id',
                        loadComponent: () =>
                            import('./home/chat/chat.component').then(
                                (m) => m.ChatComponent
                            ),
                    },
                ],
            },
            {
                path: ':id',
                loadComponent: () =>
                    import('./home/chat/chat.component').then(
                        (m) => m.ChatComponent
                    ),
            },
        ],
    },
];
