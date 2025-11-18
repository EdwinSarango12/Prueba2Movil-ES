import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tabs-asesor',
  templateUrl: './tabs-asesor.component.html',
  styleUrls: ['./tabs-asesor.component.scss'],
  standalone: false
})
export class TabsAsesorComponent implements OnInit, OnDestroy {
  currentRoute: string = '';
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Establecer ruta inicial
    this.currentRoute = this.router.url;

    // Escuchar cambios de ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        console.log('Ruta actual:', this.currentRoute);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateTo(route: string) {
    console.log('Navegando a:', route);
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    // Manejo especial para /asesor/perfil-asesor
    if (route === '/asesor/perfil-asesor') {
      return this.currentRoute.startsWith('/asesor/perfil-asesor');
    }
    
    // Para otras rutas, verificar si comienza con la ruta
    return this.currentRoute.startsWith(route);
  }
}

