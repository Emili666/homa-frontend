import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  searchQuery: string = '';
  isMenuOpen: boolean = false;
  currentUser$ = this.authService.currentUser;

  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/buscar'], {
        queryParams: { q: this.searchQuery }
      });
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
