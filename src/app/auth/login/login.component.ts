import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Aunque no usemos el toggle, es bueno tenerlo para los iconos sociales
import { AuthService } from '../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { AuthResponse } from '../../shared/types/auth-response';
import { UserService } from '../../shared/services/user.service';
import { TokenService } from '../../shared/services/token.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  SocialAuthService,
  SocialUser,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    GoogleSigninButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private httpClient: HttpClient,
    private googleAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.googleAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.onGoogleSignIn(user);
      }
    });
  }

  onLogin() {
    this.errorMessage = null;
    this.authService.login(this.email, this.password).subscribe({
      next: (res: AuthResponse) => {
        this.router.navigateByUrl('/home');
        this.userService.setUser(res.user);
        this.tokenService.setToken(res.token);
      },
      error: (err) => {
        console.error('Error en login', err);
        if (err.status === 403) {
          this.errorMessage = 'Email no verificado. Por favor verifica tu correo antes de iniciar sesión.';
          // Opcional: redirigir a verificación
          setTimeout(() => {
            this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
          }, 2000);
        } else {
          this.errorMessage = err.error?.error || 'Credenciales inválidas';
        }
      },
    });
  }

  onGoogleSignIn(user: SocialUser): void {
    this.httpClient
      .post<AuthResponse>(`${environment.apiUrl}auth/google`, {
        idToken: user.idToken,
      })
      .subscribe({
        next: (res: AuthResponse) => {
          this.router.navigateByUrl('/home');
          this.tokenService.setToken(res.token);
        },
        error: (e) => {
          console.error(e);
        },
      });
  }
}
