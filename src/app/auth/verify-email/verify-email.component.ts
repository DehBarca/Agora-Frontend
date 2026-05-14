import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  verificationCode: string = '';
  isLoading: boolean = false;
  isResending: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isVerified: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el email de los query params
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
      
      // Si viene con código en la URL (desde el link del correo)
      const code = params['code'];
      if (code && this.email) {
        this.verificationCode = code;
        this.verifyEmail();
      }
    });
  }

  verifyEmail(): void {
    if (!this.email || !this.verificationCode) {
      this.errorMessage = 'Por favor ingresa el código de verificación';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.verifyEmail(this.email, this.verificationCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isVerified = true;
        this.successMessage = res.message;
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { verified: 'true' }
          });
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Código de verificación inválido';
      },
    });
  }

  resendCode(): void {
    if (!this.email) {
      this.errorMessage = 'Email no encontrado';
      return;
    }

    this.isResending = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.resendVerificationCode(this.email).subscribe({
      next: (res) => {
        this.isResending = false;
        this.successMessage = res.message;
      },
      error: (err) => {
        this.isResending = false;
        this.errorMessage = err.error?.error || 'No se pudo reenviar el código';
      },
    });
  }
}
