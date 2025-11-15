import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from '@environments/environment';
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { ConfigService } from "../services/config.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar token JWT a las peticiones si está disponible
    const token = this.authService.getToken()
    // Usar la URL en tiempo de ejecución (ConfigService) si está disponible, si no, usar environment.apiUrl
    const runtimeApiUrl = this.configService.getApiUrl()
    const apiUrl = runtimeApiUrl || environment.apiUrl

    // Caso 1: petición absoluta hacia el API configurado (ej. http://localhost:8080/api)
    // Caso 2: petición absoluta hacia el origen del navegador con /api (ej. http://localhost:4200/api)
    // Caso 3: petición relativa que comienza con /api (ej. /api/…)
    const originApi = (typeof window !== 'undefined' ? window.location.origin : '') + '/api'
    const isApiUrl = request.url.startsWith(apiUrl) || request.url.startsWith(originApi) || request.url.startsWith('/api')

    if (token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    return next.handle(request)
  }
}
