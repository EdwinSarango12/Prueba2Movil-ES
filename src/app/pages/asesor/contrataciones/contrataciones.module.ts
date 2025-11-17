import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContratacionesPageRoutingModule } from './contrataciones-routing.module';
import { ContratacionesPage } from './contrataciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContratacionesPageRoutingModule
  ],
  declarations: [ContratacionesPage]
})
export class ContratacionesPageModule {}

