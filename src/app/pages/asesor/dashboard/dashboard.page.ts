import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../../services/plan.service';
import { ContratacionService } from '../../../services/contratacion.service';
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

  constructor(
    private planService: PlanService,
    private contratacionService: ContratacionService,
    private router: Router
  ) {}

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
    if (confirm('¿Estás seguro de eliminar este plan?')) {
      try {
        await this.planService.deletePlan(planId);
        this.loadData();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
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

