import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "@environments/environment"
import  { Alojamiento, AlojamientoRequest, BusquedaAlojamientoParams } from "../models/alojamiento.model"

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

@Injectable({
  providedIn: "root",
})
export class AlojamientoService {
  private apiUrl = `${environment.apiUrl}/alojamientos`

  constructor(private http: HttpClient) {}

  buscar(params: BusquedaAlojamientoParams): Observable<PageResponse<Alojamiento>> {
    let httpParams = new HttpParams()

    if (params.ciudad) httpParams = httpParams.set("ciudad", params.ciudad)
    if (params.fechaInicio) httpParams = httpParams.set("fechaInicio", params.fechaInicio)
    if (params.fechaFin) httpParams = httpParams.set("fechaFin", params.fechaFin)
    if (params.precioMin) httpParams = httpParams.set("precioMin", params.precioMin.toString())
    if (params.precioMax) httpParams = httpParams.set("precioMax", params.precioMax.toString())
    if (params.capacidad) httpParams = httpParams.set("capacidad", params.capacidad.toString())
    if (params.page !== undefined) httpParams = httpParams.set("page", params.page.toString())
    if (params.size !== undefined) httpParams = httpParams.set("size", params.size.toString())

    return this.http.get<PageResponse<Alojamiento>>(`${this.apiUrl}/buscar`, { params: httpParams })
  }

  obtenerPorId(id: number): Observable<Alojamiento> {
    return this.http.get<Alojamiento>(`${this.apiUrl}/${id}`)
  }

  crear(alojamiento: AlojamientoRequest): Observable<Alojamiento> {
    return this.http.post<Alojamiento>(this.apiUrl, alojamiento)
  }

  actualizar(id: number, alojamiento: AlojamientoRequest): Observable<Alojamiento> {
    return this.http.put<Alojamiento>(`${this.apiUrl}/${id}`, alojamiento)
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  obtenerMisAlojamientos(page: number = 0, size: number = 10): Observable<PageResponse<Alojamiento>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
    return this.http.get<PageResponse<Alojamiento>>(`${this.apiUrl}/mios`, { params })
  }

  subirImagen(id: number, imagen: File): Observable<string> {
    const formData = new FormData()
    formData.append("imagen", imagen)
    return this.http.post<string>(`${this.apiUrl}/${id}/imagenes`, formData)
  }
}
