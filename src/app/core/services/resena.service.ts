import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { environment } from "@environments/environment"
import { Resena, ResenaRequest, ResponderResenaRequest } from "../models/resena.model"

@Injectable({
  providedIn: "root",
})
export class ResenaService {
  private apiUrl = `${environment.apiUrl}/resenas`

  constructor(private http: HttpClient) {}

  crear(resena: ResenaRequest): Observable<Resena> {
    return this.http.post<Resena>(this.apiUrl, resena)
  }

  obtenerPorAlojamiento(alojamientoId: number): Observable<Resena[]> {
    return this.http.get<any>(`${this.apiUrl}/alojamiento/${alojamientoId}`).pipe(
      map((response: any) => response.content || [])
    )
  }

  obtenerDestacadas(): Observable<Resena[]> {
    return this.http.get<any>(`${this.apiUrl}/destacadas`, {
      params: { size: '6' }
    }).pipe(
      map((response: any) => response.content || [])
    )
  }

  responder(resenaId: number, respuesta: ResponderResenaRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${resenaId}/responder`, respuesta)
  }
}