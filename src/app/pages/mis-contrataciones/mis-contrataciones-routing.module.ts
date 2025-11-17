import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MisContratacionesPage } from './mis-contrataciones.page';

const routes: Routes = [
  {
    path: '',
    component: MisContratacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisContratacionesPageRoutingModule {}

