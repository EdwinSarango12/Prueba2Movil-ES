import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { PerfilPage } from './perfil.page';
import { TabsModule } from '../../components/tabs/tabs.module';
import { TabsAsesorModule } from '../../components/tabs-asesor/tabs-asesor.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    TabsModule,
    TabsAsesorModule
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}

