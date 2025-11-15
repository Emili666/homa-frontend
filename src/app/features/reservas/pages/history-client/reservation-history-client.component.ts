import { Component, OnInit } from "@angular/core"
import { Reserva } from "@core/models/reserva.model"
import { ReservaService } from "@core/services/reserva.service"

@Component({
  selector: "app-reservation-history-client",
  templateUrl: "./reservation-history-client.component.html",
  styleUrls: ["./reservation-history-client.component.scss"],
})
export class ReservationHistoryClientComponent implements OnInit {
  reservas: Reserva[] = []
  isLoading = false
  error?: string

  readonly estadoMensajes: Record<string, { title: string; helper: string }> = {
    PENDIENTE: { title: "Esperando confirmación", helper: "Recibirás un correo cuando el anfitrión responda." },
    CONFIRMADA: { title: "Reserva confirmada", helper: "Prepárate para el viaje, te esperamos." },
    CANCELADA: { title: "Reserva cancelada", helper: "Si fue un error, intenta reservar otra vez." },
    COMPLETADA: { title: "Experiencia completada", helper: "Deja una reseña y ayuda a otros viajeros." },
  }

  constructor(private readonly reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarHistorial()
  }

  cargarHistorial(): void {
    this.isLoading = true
    this.error = undefined

    this.reservaService.obtenerMisReservas().subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas = reservas
        this.isLoading = false
      },
      error: (err) => {
        console.error("Error obteniendo historial del cliente", err)
        this.error = err?.error?.message || "No pudimos cargar tus reservas. Intenta nuevamente."
        this.isLoading = false
      },
    })
  }

  getEstadoTitulo(estado: string): string {
    return this.estadoMensajes[estado]?.title || "Estado de la reserva"
  }

  getEstadoHelper(estado: string): string {
    return this.estadoMensajes[estado]?.helper || ""
  }

  trackByReservaId(_index: number, reserva: Reserva): number {
    return reserva.id
  }
}
