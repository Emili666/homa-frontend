import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { RoleGuard } from "./core/guards/role.guard";
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () => import("./features/home/home.module").then((m) => m.HomeModule),
      },
      {
        path: "alojamientos",
        loadChildren: () => import("./features/alojamientos/alojamientos.module").then((m) => m.AlojamientosModule),
      },
      {
        path: "buscar",
        loadChildren: () => import("./features/busqueda/busqueda.module").then((m) => m.BusquedaModule),
      },
      {
        path: "reservas",
        loadChildren: () => import("./features/reservas/reservas.module").then((m) => m.ReservasModule),
        canActivate: [AuthGuard],
      },
      {
        path: "favoritos",
        loadChildren: () => import("./features/favoritos/favoritos.module").then((m) => m.FavoritosModule),
        canActivate: [AuthGuard],
      },
      {
        path: "perfil",
        loadChildren: () => import("./features/perfil/perfil.module").then((m) => m.PerfilModule),
        canActivate: [AuthGuard],
      },
      {
        path: "anfitrion",
        loadChildren: () => import("./features/anfitrion/anfitrion.module").then((m) => m.AnfitrionModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ["ANFITRION", "ADMIN"] },
      },
    ]
  },
  {
    path: "activar-cuenta",
    loadChildren: () => import("./features/activar-cuenta/activar-cuenta.module").then((m) => m.ActivarCuentaModule),
  },
  {
    path: "auth",
    loadChildren: () => import("./features/auth/auth.module").then((m) => m.AuthModule),
  },
  { path: "**", redirectTo: "" },
];

// Export the routes to be used in app.module.ts
export { routes };
