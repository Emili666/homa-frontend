import { Injectable } from "@angular/core"
import type { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http"
import { type Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import  { AuthService } from "../services/auth.service"
import  { Router } from "@angular/router"

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o no válido, cerrar sesión
          this.authService.logout()
        }

        if (error.status === 403) {
          // Sin permisos
          this.router.navigate(["/"])
        }

        // Retornar el error para que los componentes puedan manejarlo
        const errorMessage = error.error?.message || error.message || "Error desconocido"
        return throwError(() => new Error(errorMessage))
      }),
    )
  }
}
