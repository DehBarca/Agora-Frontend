import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../types/auth-response';

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
  emailSent: boolean;
}

export interface VerifyEmailResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpnt: string = 'auth/';
  constructor(private httpClient: HttpClient) {}

  signup(
    name: string,
    email: string,
    password: string
  ): Observable<SignupResponse> {
    return this.httpClient.post<SignupResponse>(
      `${environment.apiUrl}${this.endpnt}signup`,
      { name, email, password }
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(
      `${environment.apiUrl}${this.endpnt}login`,
      { email, password }
    );
  }

  verifyEmail(email: string, code: string): Observable<VerifyEmailResponse> {
    return this.httpClient.post<VerifyEmailResponse>(
      `${environment.apiUrl}${this.endpnt}verify-email`,
      { email, code }
    );
  }

  resendVerificationCode(email: string): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(
      `${environment.apiUrl}${this.endpnt}resend-verification`,
      { email }
    );
  }

  forgotPassword(
    email: string
  ): Observable<{ message: string; emailSent: boolean }> {
    return this.httpClient.post<{ message: string; emailSent: boolean }>(
      `${environment.apiUrl}${this.endpnt}forgot-password`,
      { email }
    );
  }

  resetPassword(
    token: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(
      `${environment.apiUrl}${this.endpnt}reset-password`,
      { token, newPassword }
    );
  }
}
