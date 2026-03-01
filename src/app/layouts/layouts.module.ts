import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [MainLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, // Añadido para soportar ngModel
    SharedModule,
    AdminLayoutComponent
  ],
  exports: [MainLayoutComponent, AdminLayoutComponent]
})
export class LayoutsModule { }
