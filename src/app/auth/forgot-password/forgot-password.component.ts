import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email: string = '';
  isLoading: boolean = false;
  message: string | null = null;
  errorMessage: string | null = null;

  onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.message = null;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = response.message;
        this.email = '';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Error al solicitar recuperación de contraseña';
      }
    });
  }
}
