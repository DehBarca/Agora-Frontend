import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { GroupNavComponent } from './group-nav/group-nav.component';
import { SocketService } from '../shared/services/socket.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './header/header.component';
import { ModalsService } from '../shared/services/modals.service';
import { CreateGroupModalComponent } from '../shared/components/modals/create-group-modal/create-group-modal.component';
import { CalendarModalComponent } from '../shared/components/modals/calendar-modal/calendar-modal.component';
import { MyuserModalComponent } from '../shared/components/modals/myuser-modal/myuser-modal.component';
import { CommunitiesNavComponent } from './communities-nav/communities-nav.component';
import { VideoCallComponent } from '../shared/components/video-call/video-call.component';
import { CommonModule } from '@angular/common';
import { Group } from '../shared/types/group';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CreateGroupModalComponent,
        CalendarModalComponent,
        MyuserModalComponent,
        GroupNavComponent,
        HeaderComponent,
        RouterOutlet,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        CommunitiesNavComponent,
        VideoCallComponent,
        CommonModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    isCreateGroupOpen = false;
    isCalendarOpen = false;
    isMyUserOpen = false;
    isGroupInfoOpen = false;
    isCallOpen = false;

    group: Group = { topic: '' };

    modalTop = 100;
    modalLeft = 100;
    modalWidth = 600;
    modalHeight = 400;
    modalZIndex = 1000;

    private isDragging = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;

    private isResizing = false;
    private resizeDirection: string = '';
    private resizeStartX = 0;
    private resizeStartY = 0;
    private startTop = 0;
    private startLeft = 0;
    private startWidth = 0;
    private startHeight = 0;

    constructor(
        private sockeService: SocketService,
        private modalsService: ModalsService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.modalsService.openCreateGroup$.subscribe(
            (val) => (this.isCreateGroupOpen = val)
        );
        this.modalsService.openCalendar$.subscribe(
            (val) => (this.isCalendarOpen = val)
        );
        this.modalsService.openMyUser$.subscribe(
            (val) => (this.isMyUserOpen = val)
        );
        this.modalsService.openCall$.subscribe(
            (val) => (this.isCallOpen = val)
        );
        this.sockeService.connectWithGroups();

        console.log('📞 Suscribiendo al evento onCall...');
        this.sockeService.onCall().subscribe((group) => {
            console.log('🔔 Llamada recibida:', group);
            this.group = group;
            this.modalsService.openCall()
        });
    }

    navToFriends() {
        this.router.navigateByUrl('/home/friends');
    }

    startDrag(event: MouseEvent) {
        this.isDragging = true;
        this.dragOffsetX = event.clientX - this.modalLeft;
        this.dragOffsetY = event.clientY - this.modalTop;
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.stopDrag);
    }

    onDragMove = (event: MouseEvent) => {
        if (this.isDragging) {
            this.modalLeft = event.clientX - this.dragOffsetX;
            this.modalTop = event.clientY - this.dragOffsetY;
        }
    };

    stopDrag = () => {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.stopDrag);
    };

    startResize(event: MouseEvent, direction: string) {
        event.stopPropagation();
        this.isResizing = true;
        this.resizeDirection = direction;
        this.resizeStartX = event.clientX;
        this.resizeStartY = event.clientY;
        this.startTop = this.modalTop;
        this.startLeft = this.modalLeft;
        this.startWidth = this.modalWidth;
        this.startHeight = this.modalHeight;
        document.addEventListener('mousemove', this.onResizeMove);
        document.addEventListener('mouseup', this.stopResize);
    }
    onResizeMove = (event: MouseEvent) => {
        if (!this.isResizing) return;
        const dx = event.clientX - this.resizeStartX;
        const dy = event.clientY - this.resizeStartY;

        switch (this.resizeDirection) {
            case 'top':
                this.modalHeight = Math.max(240, this.startHeight - dy);
                this.modalTop = this.startTop + dy;
                break;
            case 'bottom':
                this.modalHeight = Math.max(240, this.startHeight + dy);
                break;
            case 'left':
                this.modalWidth = Math.max(320, this.startWidth - dx);
                this.modalLeft = this.startLeft + dx;
                break;
            case 'right':
                this.modalWidth = Math.max(320, this.startWidth + dx);
                break;
            case 'top-left':
                this.modalHeight = Math.max(240, this.startHeight - dy);
                this.modalTop = this.startTop + dy;
                this.modalWidth = Math.max(320, this.startWidth - dx);
                this.modalLeft = this.startLeft + dx;
                break;
            case 'top-right':
                this.modalHeight = Math.max(240, this.startHeight - dy);
                this.modalTop = this.startTop + dy;
                this.modalWidth = Math.max(320, this.startWidth + dx);
                break;
            case 'bottom-left':
                this.modalHeight = Math.max(240, this.startHeight + dy);
                this.modalWidth = Math.max(320, this.startWidth - dx);
                this.modalLeft = this.startLeft + dx;
                break;
            case 'bottom-right':
                this.modalHeight = Math.max(240, this.startHeight + dy);
                this.modalWidth = Math.max(320, this.startWidth + dx);
                break;
        }
    };

    stopResize = () => {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.onResizeMove);
        document.removeEventListener('mouseup', this.stopResize);
    };

    bringToFront() {
        this.modalZIndex = Date.now();
        //Por si llegas a tener varias llamadas
    }

    closeCall() {
        this.isCallOpen = false;
        this.group = { topic: '' };
    }
}
