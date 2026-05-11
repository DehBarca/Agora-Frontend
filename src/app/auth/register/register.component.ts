import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importar el Servicio
import { AuthService, SignupResponse } from '../../shared/services/auth.service';
import { TokenService } from '../../shared/services/token.service';
import { UserService } from '../../shared/services/user.service';
import { AuthResponse } from '../../shared/types/auth-response';

import {
  SocialAuthService,
  SocialUser,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';

import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    GoogleSigninButtonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private userService = inject(UserService);
  private router = inject(Router);
  private googleAuthService = inject(SocialAuthService);
  private httpClient = inject(HttpClient);
  
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  registeredEmail: string | null = null;

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });
  ngOnInit(): void {
    this.googleAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.onGoogleSignIn(user);
      }
    });
  }
  //Es lo mismo que el login
  onGoogleSignIn(user: SocialUser): void {
    this.httpClient
      .post<AuthResponse>(`${environment.apiUrl}auth/google`, {
        idToken: user.idToken,
      })
      .subscribe({
        next: (res: AuthResponse) => {
          this.router.navigateByUrl('/home');
          this.userService.setUser(res.user);
          this.tokenService.setToken(res.token);
        },
        error: () => {
          console.error('Error en login con Google');
        },
      });
  };
  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const { name, email, password } = this.registerForm.value;

    this.authService.signup(name!, email!, password!).subscribe({
      next: (res: SignupResponse) => {
        this.isLoading = false;
        this.successMessage = res.message;
        this.registeredEmail = email!;
        // Redirigir a la página de verificación
        this.router.navigate(['/verify-email'], { 
          queryParams: { email: email } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'No se pudo completar el registro.';
      },
    });
  }
}
