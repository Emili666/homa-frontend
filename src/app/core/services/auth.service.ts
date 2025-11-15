import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, tap } from "rxjs"
import { Router } from "@angular/router"
import { environment } from "@environments/environment"
import { LoginRequest, LoginResponse, RegistroUsuarioRequest, RolUsuario, Usuario } from "../models/usuario.model"
import { ConfigService } from "./config.service"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>
  public currentUser: Observable<Usuario | null>
  private apiUrl: string
  private usuariosUrl: string
  constructor(
    private http: HttpClient,
    private router: Router,
    private configService: ConfigService,
  ) {
    const storedUser = localStorage.getItem("currentUser")
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(storedUser ? JSON.parse(storedUser) : null)
    this.currentUser = this.currentUserSubject.asObservable()

    // Configurar URLs a partir del ConfigService (runtime)
    const baseApi = this.configService.getApiUrl()
    this.apiUrl = `${baseApi}/auth`
    this.usuariosUrl = `${baseApi}/usuarios`
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken()
  }

  public get isAnfitrion(): boolean {
    const user = this.currentUserValue
    const rolNormalizado = (user?.rol ?? "").toString().toUpperCase()
    return rolNormalizado === RolUsuario.ANFITRION || rolNormalizado === RolUsuario.ADMIN
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setSession(response)
      }),
    )
  }

  register(data: RegistroUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.usuariosUrl}/registro`, data)
  }

  activateAccount(codigo: string): Observable<void> {
    return this.http.get<void>(`${this.usuariosUrl}/activar/${codigo}`)
  }

  logout(): void {
    localStorage.removeItem(environment.jwtTokenKey)
    localStorage.removeItem(environment.jwtRefreshTokenKey)
    localStorage.removeItem("currentUser")
    this.currentUserSubject.next(null)
    this.router.navigate(["/auth/login"])
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(environment.jwtRefreshTokenKey)
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.setSession(response)
      }),
    )
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtTokenKey)
  }

  mockLogin(): void {
    const demoUser: Usuario = {
      id: 0,
      nombre: "Demo",
      apellido: "Usuario",
      email: "demo@correo.com",
      rol: RolUsuario.HUESPED,
      telefono: "+57 123 456 7890",
      direccion: "Carrera 45 #26-85, Bogota",
      idiomaPreferido: "es",
      monedaPreferida: "COP",
      zonaHoraria: "America/Bogota",
      notificacionesEmail: true,
      notificacionesPush: true,
      recibirOfertas: false,
    } as Usuario
    const payload: LoginResponse = {
      token: "demo-token",
      refreshToken: "demo-refresh",
      usuario: demoUser
    } as LoginResponse
    this.setSession(payload)
  }

  fetchCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.usuariosUrl}/me`).pipe(
      tap((usuario) => {
        this.updateCurrentUser(usuario)
      }),
    )
  }

  updateCurrentUser(usuario: Usuario): void {
    localStorage.setItem("currentUser", JSON.stringify(usuario))
    this.currentUserSubject.next(usuario)
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(environment.jwtTokenKey, authResult.token)
    localStorage.setItem(environment.jwtRefreshTokenKey, authResult.refreshToken)
    this.updateCurrentUser(authResult.usuario)
  }
}
