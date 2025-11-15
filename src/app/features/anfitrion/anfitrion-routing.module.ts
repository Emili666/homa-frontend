import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnfitrionComponent } from './anfitrion.component';

const routes: Routes = [{ path: '', component: AnfitrionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnfitrionRoutingModule { }
