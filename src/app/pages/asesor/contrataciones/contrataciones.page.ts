import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ContratacionService } from '../../../services/contratacion.service';
import { AuthService } from '../../../services/auth.service';
import { Contratacion } from '../../../models/contratacion.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-contrataciones',
  templateUrl: './contrataciones.page.html',
  styleUrls: ['./contrataciones.page.scss'],
  standalone: false
})
export class ContratacionesPage implements OnInit {
  contrataciones: Contratacion[] = [];
  user: User | null = null;
  loading = true;
  filtroEstado: 'todos' | 'pendiente' | 'aprobada' | 'rechazada' = 'todos';

  constructor(
    private contratacionService: ContratacionService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      this.loadContrataciones();
    });
  }

  loadContrataciones() {
    this.contratacionService.getAllContrataciones().subscribe({
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

  getContratacionesFiltradas(): Contratacion[] {
    if (this.filtroEstado === 'todos') {
      return this.contrataciones;
    }
    return this.contrataciones.filter(c => c.estado === this.filtroEstado);
  }

  async cambiarEstado(contratacion: Contratacion, nuevoEstado: 'aprobada' | 'rechazada') {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${nuevoEstado === 'aprobada' ? 'aprobar' : 'rechazar'} esta contratación?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await this.contratacionService.updateEstado(
                contratacion.id!,
                nuevoEstado,
                this.user?.uid,
                `Cambiado a ${nuevoEstado} por ${this.user?.email}`
              );
              this.loadContrataciones();
            } catch (error: any) {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: error.message || 'Error al actualizar el estado',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  abrirChat(contratacionId: string) {
    this.router.navigate(['/asesor/chat', contratacionId]);
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

