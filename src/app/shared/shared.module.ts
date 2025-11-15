import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"

// Componentes compartidos se agregarán aquí

@NgModule({
  declarations: [
    // Componentes compartidos
  ],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    // Componentes compartidos
  ],
})
export class SharedModule {}

