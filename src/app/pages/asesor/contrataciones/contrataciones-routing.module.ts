import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContratacionesPage } from './contrataciones.page';

const routes: Routes = [
  {
    path: '',
    component: ContratacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContratacionesPageRoutingModule {}

