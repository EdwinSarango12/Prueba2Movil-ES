import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { PlanMovil } from '../../models/plan.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: false
})
export class CatalogoPage implements OnInit {
  planes: PlanMovil[] = [];
  filteredPlanes: PlanMovil[] = [];
  loading = true;
  searchTerm: string = '';

  constructor(
    private planService: PlanService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlanes();
  }

  loadPlanes() {
    this.planService.getPlanesActivos().subscribe({
      next: (planes) => {
        this.planes = planes;
        this.filteredPlanes = planes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterPlanes();
  }

  filterPlanes() {
    if (!this.searchTerm.trim()) {
      this.filteredPlanes = this.planes;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPlanes = this.planes.filter(plan =>
      plan.nombre.toLowerCase().includes(term) ||
      plan.segmento.toLowerCase().includes(term)
    );
  }

  verDetalle(planId: string) {
    this.router.navigate(['/plan-detalle', planId]);
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
