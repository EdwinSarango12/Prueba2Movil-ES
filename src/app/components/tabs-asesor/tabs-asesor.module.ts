import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TabsAsesorComponent } from './tabs-asesor.component';

@NgModule({
  declarations: [TabsAsesorComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [TabsAsesorComponent]
})
export class TabsAsesorModule {}

