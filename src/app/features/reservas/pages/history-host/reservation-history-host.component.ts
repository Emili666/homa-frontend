import { Component, OnInit } from "@angular/core"
import { Reserva } from "@core/models/reserva.model"
import { ReservaService } from "@core/services/reserva.service"

@Component({
  selector: "app-reservation-history-host",
  templateUrl: "./reservation-history-host.component.html",
  styleUrls: ["./reservation-history-host.component.scss"],
})
export class ReservationHistoryHostComponent implements OnInit {
  reservas: Reserva[] = []
  isLoading = false
  error?: string

  readonly estadoEtiquetas: Record<string, { label: string; classes: string }> = {
    PENDIENTE: { label: "Pendiente", classes: "bg-amber-100 text-amber-800" },
    CONFIRMADA: { label: "Confirmada", classes: "bg-emerald-100 text-emerald-700" },
    CANCELADA: { label: "Cancelada", classes: "bg-rose-100 text-rose-700" },
    COMPLETADA: { label: "Completada", classes: "bg-blue-100 text-blue-700" },
  }

  constructor(private readonly reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarHistorial()
  }

  cargarHistorial(): void {
    this.isLoading = true
    this.error = undefined

    this.reservaService.obtenerReservasAnfitrion().subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas = reservas
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error obteniendo historial del anfitrión", err)
        this.error = err?.error?.message || "No pudimos cargar tus reservas. Intenta nuevamente."
        this.isLoading = false
      },
    })
  }

  getEstadoClasses(estado: string): string {
    return this.estadoEtiquetas[estado]?.classes || "bg-slate-100 text-slate-700"
  }

  getEstadoLabel(estado: string): string {
    return this.estadoEtiquetas[estado]?.label || estado
  }

  trackByReservaId(_index: number, reserva: Reserva): number {
    return reserva.id
  }
}
