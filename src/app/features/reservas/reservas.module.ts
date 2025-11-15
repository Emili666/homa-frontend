import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservasRoutingModule } from './reservas-routing.module';
import { ReservasComponent } from './reservas.component';
import { ReservationHistoryHostComponent } from './pages/history-host/reservation-history-host.component';
import { ReservationHistoryClientComponent } from './pages/history-client/reservation-history-client.component';


@NgModule({
  declarations: [
    ReservasComponent,
    ReservationHistoryHostComponent,
    ReservationHistoryClientComponent
  ],
  imports: [
    CommonModule,
    ReservasRoutingModule
  ]
})
export class ReservasModule { }
