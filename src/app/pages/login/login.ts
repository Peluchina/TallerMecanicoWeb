import { Component, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleBtn', { static: false }) googleBtn!: ElementRef;

  public authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public isLoading = false;
  public clientIdInput = this.authService.googleClientId;

  ngAfterViewInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/service-schedule']);
      return;
    }

    setTimeout(() => {
      this.initGoogleBtn();
    }, 300);
  }

  initGoogleBtn(): void {
    if (this.googleBtn && this.googleBtn.nativeElement) {
      this.authService.renderGoogleButton(
        this.googleBtn.nativeElement,
        (response: any) => this.handleGoogleCredential(response)
      );
    }
  }

  handleGoogleCredential(response: any): void {
    if (!response || !response.credential) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: 'No se obtuvo el token de Google.',
      });
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.loginWithGoogleToken(response.credential).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: `Sesión iniciada como ${user.name} (${user.role || 'ADMIN'})`,
          timer: 1800,
          showConfirmButton: false,
        });

        this.router.navigate(['/service-schedule']);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error al iniciar sesión con Google:', err);

        const errorMessage = err.error?.message || 'Token de Google no válido o error de servidor.';
        const errorDetails = err.error?.details ? `\n\nDetalle técnico: ${err.error.details}` : '';

        Swal.fire({
          icon: 'error',
          title: `Error ${err.status || 500} de Servidor`,
          text: errorMessage + errorDetails,
        });
      },
    });
  }

  loginDemo(role: 'ADMIN' | 'RECEPCIONISTA' = 'ADMIN'): void {
    this.isLoading = true;
    this.authService.loginDemo(role).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'success',
          title: '¡Modo Prueba Activado!',
          text: `Iniciaste sesión como ${user.name} (Rol: ${user.role})`,
          timer: 1800,
          showConfirmButton: false,
        });
        this.router.navigate(['/service-schedule']);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error en login demo:', err);
      },
    });
  }

  updateClientId(): void {
    if (this.clientIdInput.trim()) {
      this.authService.googleClientId = this.clientIdInput.trim();
      this.initGoogleBtn();
      Swal.fire({
        icon: 'info',
        title: 'Client ID Actualizado',
        text: 'Se actualizó el Google Client ID en el servicio.',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }
}
