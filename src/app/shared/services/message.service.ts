import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../types/message';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private endpnt: string = 'messages/';
  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService
  ) {}

  sendMessage(message: Message): Observable<Message> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpClient.post<Message>(
      `${environment.apiUrl}${this.endpnt}`,
      { message },
      { headers }
    );
  }

  sendImageMessage(formData: FormData): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpClient.post(
      `${environment.apiUrl}messages/image`,
      formData,
      { headers }
    );
  }
  getGroupMessages(groupId: string): Observable<Message[]> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpClient.get<Message[]>(
      `${environment.apiUrl}${this.endpnt}groupMessages/${groupId}`,
      { headers }
    );
  }

  //Edit message
  //Delete message
  //Reactions
}
