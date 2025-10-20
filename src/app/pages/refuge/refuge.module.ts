import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RefugePageRoutingModule } from './refuge-routing.module';
import { RefugePage } from './refuge.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RefugePageRoutingModule],
  declarations: [RefugePage],
})
export class RefugePageModule {}
