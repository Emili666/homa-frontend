import { Injectable } from "@angular/core"
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router"
import  { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.currentUserValue
    const requiredRoles = (route.data["roles"] as string[] | undefined)?.map((rol) => rol.toUpperCase()) ?? []
    const currentUserRole = (currentUser?.rol ?? "").toString().toUpperCase()

    if (currentUser && currentUserRole && requiredRoles.includes(currentUserRole)) {
      return true
    }

    // No tiene el rol requerido, redirigir a home
    this.router.navigate(["/"])
    return false
  }
}
