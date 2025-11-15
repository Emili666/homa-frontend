import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"

// Services
import { AuthService } from "./services/auth.service"
import { AlojamientoService } from "./services/alojamiento.service"
import { ReservaService } from "./services/reserva.service"
import { UsuarioService } from "./services/usuario.service"
import { ResenaService } from "./services/resena.service"

// Guards
import { AuthGuard } from "./guards/auth.guard"
import { RoleGuard } from "./guards/role.guard"

// Interceptors are provided in app.module.ts

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [AuthService, AlojamientoService, ReservaService, UsuarioService, ResenaService, AuthGuard, RoleGuard],
})
export class CoreModule {
  constructor() {
    // Singleton check logic should be handled elsewhere if needed
  }
}
