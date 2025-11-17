import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContratacionService } from '../../services/contratacion.service';
import { AuthService } from '../../services/auth.service';
import { Contratacion } from '../../models/contratacion.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-mis-contrataciones',
  templateUrl: './mis-contrataciones.page.html',
  styleUrls: ['./mis-contrataciones.page.scss'],
  standalone: false
})
export class MisContratacionesPage implements OnInit {
  contrataciones: Contratacion[] = [];
  user: User | null = null;
  loading = true;

  constructor(
    private contratacionService: ContratacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (user) {
        this.loadContrataciones();
      }
    });
  }

  loadContrataciones() {
    if (this.user) {
      this.contratacionService.getContratacionesByUsuario(this.user.uid).subscribe({
        next: (contrataciones) => {
          this.contrataciones = contrataciones;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading contrataciones:', error);
          this.loading = false;
        }
      });
    }
  }

  abrirChat(contratacionId: string) {
    this.router.navigate(['/chat', contratacionId]);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'aprobada':
        return 'success';
      case 'rechazada':
        return 'danger';
      case 'pendiente':
        return 'warning';
      default:
        return 'medium';
    }
  }
}

