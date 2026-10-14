import { Component, computed, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public authService = inject(AuthService);
  private readonly router = inject(Router);
  activeMenu: string | null = null;

  // Computed signals: se recalculan solo cuando currentUser cambia
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly userRole   = computed(() => this.authService.getUserRole());
  readonly isAdmin    = computed(() => this.authService.isAdmin());
  readonly isRecep    = computed(() => this.authService.isRecepcionista());
  readonly isAdminOrRecep = computed(() =>
    this.authService.hasRole(['ADMIN', 'RECEPCIONISTA'])
  );
  readonly currentUser = computed(() => this.authService.currentUser());

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  toggleMenu(menu: string): void {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  closeMenu(): void {
    this.activeMenu = null;
  }

  logout(): void {
    this.authService.logout();
  }

  // Cierra el dropdown cuando el usuario hace clic fuera del header
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-header')) {
      this.activeMenu = null;
    }
  }
}
