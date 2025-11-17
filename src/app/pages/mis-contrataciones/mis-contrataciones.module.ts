import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MisContratacionesPageRoutingModule } from './mis-contrataciones-routing.module';
import { MisContratacionesPage } from './mis-contrataciones.page';
import { TabsModule } from '../../components/tabs/tabs.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisContratacionesPageRoutingModule,
    TabsModule
  ],
  declarations: [MisContratacionesPage]
})
export class MisContratacionesPageModule {}

