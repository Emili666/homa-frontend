import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ReservasRoutingModule } from './reservas-routing.module';
import { ReservasComponent } from './reservas.component';
import { PasoFechasComponent } from './pages/fechas/fechas.component';
import { PasoDatosComponent } from './pages/datos/datos.component';
import { PasoPagoComponent } from './pages/pago/pago.component';
import { ReservationHistoryHostComponent } from './pages/history-host/reservation-history-host.component';
import { ReservationHistoryClientComponent } from './pages/history-client/reservation-history-client.component';
import { MercadoPagoButtonComponent } from '../../shared/components/mercadopago-button/mercadopago-button.component';

@NgModule({
  declarations: [
    ReservasComponent,
    PasoFechasComponent,
    PasoDatosComponent,
    PasoPagoComponent,
    ReservationHistoryHostComponent,
    ReservationHistoryClientComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ReservasRoutingModule,
    MercadoPagoButtonComponent  // standalone component
  ]
})
export class ReservasModule { }
