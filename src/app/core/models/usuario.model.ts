/**
 * Modelo que coincide EXACTAMENTE con UsuarioResponse.java del backend
 * Campos: id, nombre, email, telefono, foto, fechaNacimiento, estado, rol, esAnfitrion, creadoEn
 */
export interface Usuario {
  id: number
  nombre: string
  email: string
  telefono?: string
  foto?: string          // ← backend envía 'foto', NO 'fotoUrl'
  fechaNacimiento?: string
  estado: EstadoUsuario
  rol: RolUsuario
  esAnfitrion?: boolean
  creadoEn?: string
}

export enum RolUsuario {
  HUESPED = "Huesped",
  ANFITRION = "Anfitrion",
  ADMIN = "Administrador",
  ADMINISTRADOR = "Administrador",   // alias para el backend que lo manda como Administrador
}

export enum EstadoUsuario {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  ELIMINADO = "ELIMINADO",
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
  tipo: string
  email: string
  nombre: string
  rol: string
  usuario: Usuario
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}
