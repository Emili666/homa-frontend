export interface Resena {
  id: number
  alojamientoId: number
  tituloAlojamiento: string
  usuarioId: string
  nombreUsuario: string
  fotoUsuario?: string
  calificacion: number
  comentario: string
  mensaje?: string
  respondidoEn?: string
  creadoEn: string
}

export interface ResenaRequest {
  alojamientoId: number
  calificacion: number
  comentario: string
}

export interface ResponderResenaRequest {
  mensaje: string
}
