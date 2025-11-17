import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../services/plan.service';
import { AuthService } from '../services/auth.service';
import { PlanMovil } from '../models/plan.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  planes: PlanMovil[] = [];
  filteredPlanes: PlanMovil[] = [];
  user: User | null = null;
  loading = true;
  searchTerm: string = '';

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });

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

  contratar(planId: string) {
    if (this.user) {
      this.router.navigate(['/plan-detalle', planId]);
    } else {
      this.router.navigate(['/login']);
    }
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
