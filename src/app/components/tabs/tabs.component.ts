import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil, first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ContratacionService } from '../../services/contratacion.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: false
})
export class TabsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  currentRoute: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private contratacionService: ContratacionService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });

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
        console.log('Ruta actual (usuario):', this.currentRoute);
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

  navigateToChat() {
    // Si el usuario está en una ruta de chat, no hacer nada
    if (this.currentRoute.startsWith('/chat/')) {
      return;
    }

    // Intentar obtener la primera contratación del usuario
    if (this.user) {
      this.contratacionService.getContratacionesByUsuario(this.user.uid)
        .pipe(first())
        .subscribe({
          next: (contrataciones) => {
            if (contrataciones && contrataciones.length > 0) {
              // Navegar al chat de la primera contratación
              this.router.navigate(['/chat', contrataciones[0].id]);
            } else {
              // Si no hay contrataciones, navegar a mis contrataciones
              this.router.navigate(['/mis-contrataciones']);
            }
          },
          error: () => {
            // En caso de error, navegar a mis contrataciones
            this.router.navigate(['/mis-contrataciones']);
          }
        });
    } else {
      // Si no hay usuario, navegar a mis contrataciones
      this.router.navigate(['/mis-contrataciones']);
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }
}

