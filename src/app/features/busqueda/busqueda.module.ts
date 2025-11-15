import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResultadosComponent } from './pages/resultados/resultados.component';

const routes: Routes = [
  {
    path: '',
    component: ResultadosComponent
  }
];

@NgModule({
  declarations: [
    ResultadosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class BusquedaModule { }
