import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { environment } from "@environments/environment"
import  { Reserva, ReservaRequest } from "../models/reserva.model"

@Injectable({
  providedIn: "root",
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`

  constructor(private http: HttpClient) {}

  crear(reserva: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva)
  }

  obtenerMisReservas(): Observable<Reserva[]> {
    return this.http.get<any>(`${this.apiUrl}/mis-reservas`).pipe(
      map((response: any) => response.content || [])
    )
  }

  obtenerReservasAnfitrion(): Observable<Reserva[]> {
    const url = `${this.apiUrl}/anfitrion`;
    console.log('=== SERVICIO RESERVA ===');
    console.log('Llamando a URL:', url);
    console.log('API Base URL:', this.apiUrl);
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        console.log('Respuesta recibida del backend:', response);
        console.log('Content:', response.content);
        return response.content || [];
      })
    )
  }

  obtenerPorId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`)
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  verificarDisponibilidad(alojamientoId: number, fechaInicio: string, fechaFin: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/disponibilidad/${alojamientoId}`, {
      params: { fechaInicio, fechaFin },
    })
  }

  cambiarEstado(reservaId: number, nuevoEstado: string): Observable<void> {
    console.log(`Cambiando estado de reserva ${reservaId} a ${nuevoEstado}`);
    return this.http.patch<void>(`${this.apiUrl}/${reservaId}/estado`, null, {
      params: { estado: nuevoEstado }
    })
  }

  // Confirmar una reserva (de PENDIENTE a CONFIRMADA)
  confirmar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirmar`, {})
  }

  // Rechazar una reserva (de PENDIENTE a CANCELADA)
  rechazar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/rechazar`, {})
  }

  // Completar una reserva (de CONFIRMADA a COMPLETADA)
  completar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/completar`, {})
  }

  // Obtener reservas completadas (para dejar reseñas)
  obtenerReservasCompletadas(): Observable<Reserva[]> {
    return this.http.get<any>(`${this.apiUrl}/completadas`).pipe(
      map((response: any) => response.content || [])
    )
  }
}