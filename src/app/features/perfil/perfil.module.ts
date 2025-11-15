import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PerfilRoutingModule } from './perfil-routing.module';
import { PerfilComponent } from './perfil.component';

@NgModule({
  declarations: [PerfilComponent],
  imports: [CommonModule, ReactiveFormsModule, PerfilRoutingModule],
})
export class PerfilModule {}
