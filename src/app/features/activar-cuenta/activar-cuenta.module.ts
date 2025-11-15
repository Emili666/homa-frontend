import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Routes } from "@angular/router"
import { ActivarCuentaPageComponent } from "./activar-cuenta.component"
import { AtomicModule } from "../../atomic/atomic.module"

const routes: Routes = [
  {
    path: "",
    component: ActivarCuentaPageComponent,
  },
]

@NgModule({
  declarations: [ActivarCuentaPageComponent],
  imports: [
    CommonModule,
    AtomicModule,
    RouterModule.forChild(routes),
  ],
})
export class ActivarCuentaModule {}
