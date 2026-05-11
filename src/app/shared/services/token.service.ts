import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  logout(): void{
    sessionStorage.removeItem('token');
    return;
  }

  hasToken(): boolean{
    return !!sessionStorage.getItem('token');
  }

  setToken(token: string): void{
    sessionStorage.setItem('token', token);
    return;
  }

  getToken():string{
    const token = sessionStorage.getItem('token') || '';
    return token;
  }
}
