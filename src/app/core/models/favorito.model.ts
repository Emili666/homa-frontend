export interface Favorito {
  id: number
  usuarioId: number
  alojamientoId: number
  fechaCreacion: string
}

export interface FavoritoConAlojamiento {
  id: number
  alojamiento: {
    id: number
    titulo: string
    descripcion: string
    ciudad: string
    direccion: string
    precioPorNoche: number
    capacidad: number
    imagenUrl: string
  }
  fechaCreacion: string
}

export interface FavoritoRequest {
  alojamientoId: number
}
