import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanDetallePage } from './plan-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: PlanDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanDetallePageRoutingModule {}

