import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AnfitrionRoutingModule } from './anfitrion-routing.module';
import { AnfitrionComponent } from './anfitrion.component';


@NgModule({
  declarations: [
    AnfitrionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AnfitrionRoutingModule
  ]
})
export class AnfitrionModule { }
