import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservasComponent } from './reservas.component';
import { PasoFechasComponent } from './pages/fechas/fechas.component';
import { PasoDatosComponent } from './pages/datos/datos.component';
import { PasoPagoComponent } from './pages/pago/pago.component';
import { ReservationHistoryHostComponent } from './pages/history-host/reservation-history-host.component';
import { ReservationHistoryClientComponent } from './pages/history-client/reservation-history-client.component';

const routes: Routes = [
  {
    path: '',
    component: ReservasComponent,
    children: [
      { path: '', redirectTo: 'fechas', pathMatch: 'full' },
      { path: 'fechas', component: PasoFechasComponent },
      { path: 'datos', component: PasoDatosComponent },
      { path: 'pago', component: PasoPagoComponent },
      { path: 'historial/cliente', component: ReservationHistoryClientComponent },
      { path: 'historial/anfitrion', component: ReservationHistoryHostComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservasRoutingModule { }
