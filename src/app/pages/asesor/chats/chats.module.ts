import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatsPageRoutingModule } from './chats-routing.module';
import { ChatsPage } from './chats.page';
import { TabsAsesorModule } from '../../../components/tabs-asesor/tabs-asesor.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatsPageRoutingModule,
    TabsAsesorModule
  ],
  declarations: [ChatsPage]
})
export class ChatsPageModule {}
