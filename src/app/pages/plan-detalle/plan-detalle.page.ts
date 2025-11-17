import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { PlanService } from '../../services/plan.service';
import { ContratacionService } from '../../services/contratacion.service';
import { AuthService } from '../../services/auth.service';
import { PlanMovil } from '../../models/plan.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-plan-detalle',
  templateUrl: './plan-detalle.page.html',
  styleUrls: ['./plan-detalle.page.scss'],
  standalone: false
})
export class PlanDetallePage implements OnInit {
  plan: PlanMovil | null = null;
  planId: string = '';
  user: User | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private contratacionService: ContratacionService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.planId = this.route.snapshot.paramMap.get('id') || '';
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
    this.loadPlan();
  }

  loadPlan() {
    if (this.planId) {
      this.planService.getPlan(this.planId).subscribe({
        next: (plan) => {
          this.plan = plan || null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading plan:', error);
          this.loading = false;
        }
      });
    }
  }

  async contratar() {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.plan) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Contratación',
      message: `¿Deseas contratar el plan ${this.plan.nombre} por $${this.plan.precio}/mes?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              if (!this.plan) return;
              await this.contratacionService.createContratacion({
                planId: this.planId,
                planNombre: this.plan.nombre,
                usuarioId: this.user!.uid,
                usuarioEmail: this.user!.email
              });

              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Solicitud de contratación enviada. Un asesor se pondrá en contacto contigo.',
                buttons: [{
                  text: 'OK',
                  handler: () => {
                    this.router.navigate(['/mis-contrataciones']);
                  }
                }]
              });
              await successAlert.present();
            } catch (error: any) {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: error.message || 'Error al crear la contratación',
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

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getPlanColorClass(segmento: string): string {
    switch (segmento) {
      case 'basico':
        return 'gradient-purple-blue';
      case 'medio':
        return 'gradient-pink-red';
      case 'premium':
        return 'gradient-blue';
      default:
        return 'gradient-purple-blue';
    }
  }

  getPlanDescription(segmento: string): string {
    switch (segmento) {
      case 'basico':
        return 'Perfecto para navegar y estar conectado';
      case 'medio':
        return 'Para quienes necesitan más datos';
      case 'premium':
        return 'Sin límites para tu conexión';
      default:
        return 'Plan móvil de Tigo';
    }
  }
}

