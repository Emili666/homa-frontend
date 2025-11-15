import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlojamientosComponent } from './alojamientos.component';
import { DetalleAlojamientoComponent } from './pages/detalle/detalle.component';

const routes: Routes = [
  { path: '', component: AlojamientosComponent },
  { path: ':id', component: DetalleAlojamientoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlojamientosRoutingModule { }
