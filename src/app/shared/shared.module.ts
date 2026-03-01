import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { SidebarComponent } from "./components/sidebar/sidebar.component"

// Componentes compartidos se agregarán aquí

@NgModule({
  declarations: [
    // Componentes compartidos
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, SidebarComponent],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SidebarComponent
    // Componentes compartidos
  ],
})
export class SharedModule { }

