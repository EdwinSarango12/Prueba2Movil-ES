import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs-asesor',
  templateUrl: './tabs-asesor.component.html',
  styleUrls: ['./tabs-asesor.component.scss'],
  standalone: false
})
export class TabsAsesorComponent {
  currentRoute: string = '';

  constructor(private router: Router) {
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

