import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FavoritosRoutingModule } from './favoritos-routing.module';
import { ListaFavoritosComponent } from './pages/lista-favoritos/lista-favoritos.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FavoritosRoutingModule,
    ListaFavoritosComponent
  ]
})
export class FavoritosModule { }
