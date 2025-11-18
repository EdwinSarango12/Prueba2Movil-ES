import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { PlanService } from '../../../services/plan.service';
import { ContratacionService } from '../../../services/contratacion.service';
import { AuthService } from '../../../services/auth.service';
import { PlanMovil } from '../../../models/plan.model';
import { Contratacion } from '../../../models/contratacion.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  planes: PlanMovil[] = [];
  contratacionesPendientes: Contratacion[] = [];
  loading = true;
  showCrearPlanForm = false;
  crearPlanForm: FormGroup;

  constructor(
    private planService: PlanService,
    private contratacionService: ContratacionService,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.crearPlanForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      datosGB: ['', [Validators.required]],
      minutosVoz: ['', [Validators.required]],
      segmento: ['basico', Validators.required],
      sms: ['Ilimitados', Validators.required],
      velocidad: ['4G', Validators.required],
      redesSociales: ['Gratis', Validators.required],
      whatsapp: ['Gratis', Validators.required],
      llamadasInternacionales: ['No incluidas', Validators.required],
      roaming: ['No incluido', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.planService.getAllPlanes().subscribe({
      next: (planes) => {
        this.planes = planes;
        this.loading = false;
      }
    });

    this.contratacionService.getContratacionesPendientes().subscribe({
      next: (contrataciones) => {
        this.contratacionesPendientes = contrataciones;
      }
    });
  }

  toggleCrearPlanForm() {
    this.showCrearPlanForm = !this.showCrearPlanForm;
    if (!this.showCrearPlanForm) {
      this.crearPlanForm.reset({ segmento: 'basico' });
    }
  }

  async crearPlanRapido() {
    if (this.crearPlanForm.invalid) {
      await this.presentAlert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando plan...'
    });
    await loading.present();

    try {
      const userId = await this.authService.getCurrentUserId();
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const newPlan: PlanMovil = {
        ...this.crearPlanForm.value,
        activo: true
      };

      await this.planService.createPlan(newPlan, userId);
      await loading.dismiss();

      await this.presentAlert('Éxito', 'Plan creado correctamente');
      this.crearPlanForm.reset({ segmento: 'basico' });
      this.showCrearPlanForm = false;
      this.loadData();
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error creating plan:', error);
      await this.presentAlert('Error', error.message || 'Error al crear el plan');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  crearPlan() {
    this.router.navigate(['/asesor/plan-form']);
  }

  editarPlan(planId: string) {
    this.router.navigate(['/asesor/plan-form', planId]);
  }

  verContrataciones() {
    this.router.navigate(['/asesor/contrataciones']);
  }

  async eliminarPlan(planId: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar Plan',
      message: '¿Estás seguro de que deseas eliminar este plan?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando plan...'
            });
            await loading.present();
            try {
              await this.planService.deletePlan(planId);
              await loading.dismiss();
              this.loadData();
            } catch (error) {
              await loading.dismiss();
              console.error('Error deleting plan:', error);
              await this.presentAlert('Error', 'Error al eliminar el plan');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
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

