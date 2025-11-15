import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { AuthService } from "../../core/services/auth.service"

type ActivacionEstado = "inicial" | "exito" | "error" | "codigo_invalido"

@Component({
  selector: "app-activar-cuenta-page",
  templateUrl: "./activar-cuenta.component.html",
  styleUrls: ["./activar-cuenta.component.scss"],
})
export class ActivarCuentaPageComponent implements OnInit {
  estado: ActivacionEstado = "inicial"
  mensaje?: string
  isLoading = true

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get("codigo")

    if (!codigo) {
      this.isLoading = false
      this.estado = "codigo_invalido"
      this.mensaje = "El enlace de activacion es invalido o no contiene un codigo."
      return
    }

    this.authService.activateAccount(codigo).subscribe({
      next: () => {
        this.isLoading = false
        this.estado = "exito"
        this.mensaje = "Cuenta activada correctamente. Ya puedes iniciar sesion."
      },
      error: (err) => {
        this.isLoading = false
        this.estado = "error"
        const backendMessage = err?.error?.message ?? err?.message
        this.mensaje = backendMessage || "No pudimos activar tu cuenta. Verifica el codigo e intentalo nuevamente."
      },
    })
  }

  irAlLogin(): void {
    this.router.navigate(["/auth/login"])
  }
}
