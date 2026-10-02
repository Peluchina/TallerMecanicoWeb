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

  public loginWithGoogleToken(idToken: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap((user) => {
        this.setSession(user);
      })
    );
  }

  public loginDemo(): Observable<User> {
    return this.loginWithGoogleToken('demo-token-google');
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
