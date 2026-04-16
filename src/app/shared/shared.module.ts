import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { SidebarComponent } from "./components/sidebar/sidebar.component"
import { MapaComponent } from "./components/mapa/mapa.component"

@NgModule({
  declarations: [
    MapaComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, SidebarComponent],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SidebarComponent,
    MapaComponent,
  ],
})
export class SharedModule { }

