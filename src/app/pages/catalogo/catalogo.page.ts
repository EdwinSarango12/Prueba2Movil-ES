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

  // Planes predeterminados para invitados
  private planesDefault: PlanMovil[] = [
    {
      id: 'plan-smart-5gb',
      nombre: 'Plan Smart 5GB',
      segmento: 'basico',
      datosGB: 5,
      minutosVoz: 100,
      precio: 15.99,
      sms: 'Ilimitados',
      velocidad: '4G',
      redesSociales: 'Gratis',
      whatsapp: 'Gratis',
      llamadasInternacionales: 'No incluidas',
      roaming: 'No incluido',
      activo: true,
      createdAt: new Date(),
      createdBy: 'admin'
    },
    {
      id: 'plan-premium-15gb',
      nombre: 'Plan Premium 15GB',
      segmento: 'medio',
      datosGB: 15,
      minutosVoz: 300,
      precio: 29.99,
      sms: 'Ilimitados',
      velocidad: '4G LTE',
      redesSociales: 'Gratis',
      whatsapp: 'Ilimitado',
      llamadasInternacionales: 'Incluidas',
      roaming: 'Incluido',
      activo: true,
      createdAt: new Date(),
      createdBy: 'admin'
    },
    {
      id: 'plan-ilimitado',
      nombre: 'Plan Ilimitado',
      segmento: 'premium',
      datosGB: 'ILIMITADOS',
      minutosVoz: 'ILIMITADOS',
      precio: 45.99,
      sms: 'Ilimitados',
      velocidad: '5G',
      redesSociales: 'Gratis',
      whatsapp: 'Ilimitado',
      llamadasInternacionales: 'Ilimitadas',
      roaming: 'Incluido',
      activo: true,
      createdAt: new Date(),
      createdBy: 'admin'
    }
  ];

  constructor(
    private planService: PlanService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlanes();
  }

  loadPlanes() {
    this.loading = true;
    console.log('Cargando planes activos en catálogo...');
    
    const subscription = this.planService.getPlanesActivos().subscribe({
      next: (planes) => {
        console.log('Planes cargados en catálogo:', planes.length);
        // Si no hay planes en la BD, usar planes predeterminados
        const planesAMostrar = planes && planes.length > 0 ? planes : this.planesDefault;
        this.planes = planesAMostrar;
        this.filteredPlanes = planesAMostrar;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        // En caso de error, mostrar planes predeterminados
        console.log('Mostrando planes predeterminados');
        this.planes = this.planesDefault;
        this.filteredPlanes = this.planesDefault;
        this.loading = false;
      }
    });
    
    // Timeout de seguridad: si no carga en 10 segundos, detener
    setTimeout(() => {
      if (this.loading) {
        console.warn('Timeout al cargar planes en catálogo, mostrando planes predeterminados');
        subscription.unsubscribe();
        this.planes = this.planesDefault;
        this.filteredPlanes = this.planesDefault;
        this.loading = false;
      }
    }, 10000);
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
