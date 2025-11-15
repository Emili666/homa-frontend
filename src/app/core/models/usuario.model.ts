export interface Usuario {
  id: number
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  direccion?: string
  fotoUrl?: string
  rol: RolUsuario
  estado: EstadoUsuario
  fechaRegistro: Date
  idiomaPreferido?: string
  monedaPreferida?: string
  zonaHoraria?: string
  notificacionesEmail?: boolean
  notificacionesPush?: boolean
  recibirOfertas?: boolean
}

export enum RolUsuario {
  HUESPED = "HUESPED",
  ANFITRION = "ANFITRION",
  ADMIN = "ADMIN",
}

export enum EstadoUsuario {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  PENDIENTE_ACTIVACION = "PENDIENTE_ACTIVACION",
}

export interface RegistroUsuarioRequest {
  nombre: string
  email: string
  contrasena: string
  telefono: string
  fechaNacimiento: string
  rol: "Huesped" | "Anfitrion"
  foto?: string
}

export interface LoginRequest {
  email: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  usuario: Usuario
}
