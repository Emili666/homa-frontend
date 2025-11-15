import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '@environments/environment'
import { Favorito, FavoritoConAlojamiento } from '../models/favorito.model'

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private apiUrl = `${environment.apiUrl}/favoritos`

  constructor(private http: HttpClient) {}

  // Obtener todos los favoritos del usuario autenticado
  // GET /api/favoritos/mios?page=0&size=10
  obtenerMisFavoritos(page: number = 0, size: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mios?page=${page}&size=${size}`)
  }

  // Agregar un alojamiento a favoritos
  // POST /api/favoritos/{alojamientoId}
  agregarFavorito(alojamientoId: number): Observable<Favorito> {
    return this.http.post<Favorito>(`${this.apiUrl}/${alojamientoId}`, {})
  }

  // Eliminar un alojamiento de favoritos
  // DELETE /api/favoritos/{alojamientoId}
  eliminarFavorito(alojamientoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${alojamientoId}`)
  }

  // Verificar si un alojamiento está en favoritos
  // GET /api/favoritos/alojamiento/{alojamientoId}/estado
  esFavorito(alojamientoId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/alojamiento/${alojamientoId}/estado`)
  }

  // Obtener cantidad de favoritos de un alojamiento (para anfitriones)
  // Esta info ya viene en AlojamientoResponse.totalFavoritos
  obtenerCantidadFavoritos(alojamientoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/alojamiento/${alojamientoId}/cantidad`)
  }

  // Obtener todos los favoritos de los alojamientos del anfitrión
  // GET /api/favoritos/mis-alojamientos
  obtenerFavoritosDeAlojamientos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-alojamientos`)
  }
}
