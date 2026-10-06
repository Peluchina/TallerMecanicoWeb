import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/Auth';
  
  // Puedes cambiar esta constante con tu Google Client ID real de Google Cloud Console
  public googleClientId = '1057775251532-dbuepkgvg50v6462naiarb8lqbjj2vr0.apps.googleusercontent.com';

  public currentUser = signal<User | null>(this.getStoredUser());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getStoredUser(): User | null {
    const saved = localStorage.getItem('taller_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  public getUserRole(): string {
    const user = this.currentUser();
    if (!user) return '';

    let role = user.role || (user as any).rol || '';

    if (!role && user.token) {
      role = this.getRoleFromToken(user.token);
    }

    const upper = role.toString().toUpperCase().trim();
    if (upper.includes('RECEPCION')) {
      return 'RECEPCIONISTA';
    }
    if (upper.includes('ADMIN')) {
      return 'ADMIN';
    }

    return upper || 'ADMIN';
  }

  public hasRole(allowedRoles: string[]): boolean {
    const currentRole = this.getUserRole();
    return allowedRoles.map((r) => r.toUpperCase()).includes(currentRole);
  }

  public isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  public isRecepcionista(): boolean {
    return this.getUserRole() === 'RECEPCIONISTA';
  }

  private getRoleFromToken(token: string): string {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return '';
      const payload = JSON.parse(atob(parts[1]));
      return (
        payload.role ||
        payload.roles ||
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        ''
      );
    } catch {
      return '';
    }
  }

  public loginWithGoogleToken(idToken: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap((user) => {
        this.setSession(user);
      })
    );
  }

  public loginDemo(requestedRole: string = 'ADMIN'): Observable<User> {
    return new Observable<User>((observer) => {
      this.loginWithGoogleToken('demo-token-google').subscribe({
        next: (user) => {
          observer.next(user);
          observer.complete();
        },
        error: (err) => {
          console.warn('Backend no disponible o devolvió error en login demo, usando sesión demo de prueba:', err);
          const demoUser: User = {
            email: requestedRole === 'RECEPCIONISTA' ? 'recepcion@taller.com' : 'admin@taller.com',
            name: requestedRole === 'RECEPCIONISTA' ? 'Recepción Demo' : 'Administrador Demo',
            role: requestedRole,
            picture: 'https://lh3.googleusercontent.com/a/default-user',
            token: 'demo-local-jwt-token'
          };
          this.setSession(demoUser);
          observer.next(demoUser);
          observer.complete();
        }
      });
    });
  }

  public logout(): void {
    localStorage.removeItem('taller_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(user: User): void {
    localStorage.setItem('taller_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  public renderGoogleButton(element: HTMLElement, handleCredentialResponse: (response: any) => void): void {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: handleCredentialResponse,
      });

      google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 280,
      });
    }
  }
}
