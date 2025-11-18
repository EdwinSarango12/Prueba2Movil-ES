import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlanFormPageRoutingModule } from './plan-form-routing.module';
import { PlanFormPage } from './plan-form.page';
import { TabsAsesorModule } from '../../../components/tabs-asesor/tabs-asesor.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlanFormPageRoutingModule,
    TabsAsesorModule
  ],
  declarations: [PlanFormPage]
})
export class PlanFormPageModule {}

