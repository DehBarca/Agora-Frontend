import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalsService {
  constructor() {}

  private _openCreateGroup = new BehaviorSubject<boolean>(false);
  openCreateGroup$ = this._openCreateGroup.asObservable();
  openCreateGroup() {
    this._openCreateGroup.next(true);
  }
  closeCreateGroup() {
    this._openCreateGroup.next(false);
  }
  
  private _openCreateCommunity = new BehaviorSubject<boolean>(false);
  openCreateCommunity$ = this._openCreateCommunity.asObservable();
  openCreateCommunity() {
    this._openCreateCommunity.next(true);
  }
  closeCreateCommunity() {
    this._openCreateCommunity.next(false);
  }

  private _openCalendar = new BehaviorSubject<boolean>(false);
  openCalendar$ = this._openCalendar.asObservable();

  openCalendar() {
    this._openCalendar.next(true);
  }
  closeCalendar() {
    this._openCalendar.next(false);
  }

  private _openMyUser = new BehaviorSubject<boolean>(false);
  openMyUser$ = this._openMyUser.asObservable();

  openMyUser() {
    this._openMyUser.next(true);
  }
  closeMyUser() {
    this._openMyUser.next(false);
  }

  private _openGroupInfo = new BehaviorSubject<boolean>(false);
  openGroupInfo$ = this._openGroupInfo.asObservable();

  openGroupInfo() {
    this._openGroupInfo.next(true);
  }
  closeGroupInfo() {
    this._openGroupInfo.next(false);
  }

  private _openAddMembers = new BehaviorSubject<boolean>(false);
  openAddMembers$ = this._openAddMembers.asObservable();

  openAddMembers() {
    this._openAddMembers.next(true);
  }

  closeAddMembers() {
    this._openAddMembers.next(false);
  }

    private _openCall = new BehaviorSubject<boolean>(false);
  openCall$ = this._openCall.asObservable();

  openCall() {
    this._openCall.next(true);
  }

  closeCall() {
    this._openCall.next(false);
  }
}
