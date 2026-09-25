import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  activeMenu: string | null = null;

  toggleMenu(menu: string): void {
    this.activeMenu =
      this.activeMenu === menu ? null : menu;
  }

  closeMenu(): void {
    this.activeMenu = null;
  }
}
