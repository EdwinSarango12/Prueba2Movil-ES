import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlanDetallePageRoutingModule } from './plan-detalle-routing.module';
import { PlanDetallePage } from './plan-detalle.page';
import { TabsModule } from '../../components/tabs/tabs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanDetallePageRoutingModule,
    TabsModule
  ],
  declarations: [PlanDetallePage]
})
export class PlanDetallePageModule {}

