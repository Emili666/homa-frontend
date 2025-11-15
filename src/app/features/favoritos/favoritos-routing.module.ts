import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaFavoritosComponent } from './pages/lista-favoritos/lista-favoritos.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ListaFavoritosComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FavoritosRoutingModule { }
