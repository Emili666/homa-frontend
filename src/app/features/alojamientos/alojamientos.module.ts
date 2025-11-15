import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlojamientosRoutingModule } from './alojamientos-routing.module';
import { AlojamientosComponent } from './alojamientos.component';
import { DetalleAlojamientoComponent } from './pages/detalle/detalle.component';
import { BotonFavoritoComponent } from '../../shared/components/boton-favorito/boton-favorito.component';


@NgModule({
  declarations: [
    AlojamientosComponent,
    DetalleAlojamientoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AlojamientosRoutingModule,
    BotonFavoritoComponent
  ]
})
export class AlojamientosModule { }
