import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from './main-layout/main-layout.component';

@NgModule({
  declarations: [MainLayoutComponent],
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule // Añadido para soportar ngModel
  ],
  exports: [MainLayoutComponent]
})
export class LayoutsModule {}
