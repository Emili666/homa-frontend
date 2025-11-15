export interface Alojamiento {
  id: number
  titulo: string
  descripcion: string
  direccion: string
  ciudad: string
  latitud: number
  longitud: number
  precioPorNoche: number
  maxHuespedes: number
  imagenes: string[]
  servicios: Servicio[]
  calificacionPromedio: number
  estado: EstadoAlojamiento
  anfitrionId: string
  nombreAnfitrion: string
  fotoAnfitrion?: string
  totalResenas?: number
  totalFavoritos?: number
  esFavorito?: boolean
  creadoEn?: string
}

export enum EstadoAlojamiento {
  PENDIENTE = "PENDIENTE",
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  ELIMINADO = "ELIMINADO",
}

export enum Servicio {
  WIFI = "WIFI",
  PISCINA = "PISCINA",
  ESTACIONAMIENTO = "ESTACIONAMIENTO",
  AIRE_ACONDICIONADO = "AIRE_ACONDICIONADO",
  COCINA = "COCINA",
  MASCOTAS = "MASCOTAS",
  TV = "TV",
  LAVADORA = "LAVADORA",
}

export interface AlojamientoRequest {
  titulo: string
  descripcion: string
  direccion: string
  ciudad: string
  latitud: number
  longitud: number
  precioPorNoche: number
  maxHuespedes: number
  imagenes: string[]
  servicios: Servicio[]
  estado?: EstadoAlojamiento
}

export interface BusquedaAlojamientoParams {
  ciudad?: string
  fechaInicio?: string
  fechaFin?: string
  precioMin?: number
  precioMax?: number
  capacidad?: number
  servicios?: Servicio[]
  page?: number
  size?: number
}
