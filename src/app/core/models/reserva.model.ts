export interface Reserva {
  id: number
  alojamientoId: number
  tituloAlojamiento: string
  ciudadAlojamiento: string
  huespedId: string
  nombreHuesped: string
  emailHuesped?: string
  telefonoHuesped?: string
  cantidadHuespedes: number
  fechaEntrada: string
  fechaSalida: string
  precio: number
  estado: EstadoReserva
  creadoEn: string
  fechaCreacion?: string
}

export enum EstadoReserva {
  PENDIENTE = "PENDIENTE",
  CONFIRMADA = "CONFIRMADA",
  CANCELADA = "CANCELADA",
  COMPLETADA = "COMPLETADA",
}

export interface ReservaRequest {
  alojamientoId: number
  cantidadHuespedes: number
  fechaEntrada: string
  fechaSalida: string
}
