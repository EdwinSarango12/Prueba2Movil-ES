import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: false
})
export class TabsComponent {
  user: User | null = null;
  currentRoute: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
    
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }
}

