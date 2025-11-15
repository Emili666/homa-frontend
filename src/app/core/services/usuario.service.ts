import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "@environments/environment"
import type { Usuario } from "../models/usuario.model"

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`)
  }

  actualizarPerfil(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, usuario)
  }

  actualizarPerfilConFoto(formData: FormData): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/me`, formData)
  }

  cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/cambiar-contrasena`, {
      contrasenaActual,
      contrasenaNueva,
    })
  }

  recuperarContrasena(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/recuperar-contrasena`, { email })
  }

  restablecerContrasena(codigo: string, nuevaContrasena: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/restablecer-contrasena`, {
      codigo,
      nuevaContrasena,
    })
  }
}
