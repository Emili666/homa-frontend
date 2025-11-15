import { Component, type OnInit, OnDestroy } from "@angular/core"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"
import { AlojamientoService } from "../../core/services/alojamiento.service"
import { ResenaService } from "../../core/services/resena.service"
import { Alojamiento } from "../../core/models/alojamiento.model"
import { Resena } from "../../core/models/resena.model"
import { Router } from "@angular/router"

interface CiudadDestacada {
  nombre: string
  icono: string
  cantidad: number
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  alojamientosDestacados: Alojamiento[] = []
  ciudadesDestacadas: CiudadDestacada[] = []
  resenasDestacadas: Resena[] = []
  isLoading = false
  isLoadingResenas = false
  error?: string

  private readonly destroy$ = new Subject<void>()

  constructor(
    private alojamientoService: AlojamientoService,
    private resenaService: ResenaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientosDestacados()
    this.cargarResenasDestacadas()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  cargarAlojamientosDestacados(): void {
    this.isLoading = true
    this.error = undefined

    // Cargar los primeros 6 alojamientos
    this.alojamientoService
      .buscar({ page: 0, size: 6 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.alojamientosDestacados = response.content || []
          this.extraerCiudades(response.content || [])
          this.isLoading = false
        },
        error: (err: any) => {
          console.error('Error cargando alojamientos:', err)
          this.error = 'No se pudieron cargar los alojamientos'
          this.isLoading = false
        }
      })
  }

  extraerCiudades(alojamientos: Alojamiento[]): void {
    // Obtener ciudades únicas
    const ciudadesMap = new Map<string, number>()

    alojamientos.forEach(alojamiento => {
      const ciudad = alojamiento.ciudad
      ciudadesMap.set(ciudad, (ciudadesMap.get(ciudad) || 0) + 1)
    })

    // Convertir a array y tomar las 6 primeras
    this.ciudadesDestacadas = Array.from(ciudadesMap.entries())
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        icono: this.getIconoCiudad(nombre)
      }))
      .slice(0, 6)
  }

  getIconoCiudad(ciudad: string): string {
    // Asignar iconos según la ciudad
    const iconos: { [key: string]: string } = {
      'Cartagena': 'fa-umbrella-beach',
      'Bogotá': 'fa-building',
      'Medellín': 'fa-mountain',
      'Santa Marta': 'fa-water',
      'Cali': 'fa-city',
      'Barranquilla': 'fa-sun',
    }
    return iconos[ciudad] || 'fa-map-marker-alt'
  }

  verAlojamiento(id: number): void {
    this.router.navigate(['/alojamientos', id])
  }

  verMasAlojamientos(): void {
    this.router.navigate(['/alojamientos'])
  }

  buscarPorCiudad(ciudad: string): void {
    this.router.navigate(['/alojamientos'], {
      queryParams: { ciudad: ciudad }
    })
  }

  cargarResenasDestacadas(): void {
    this.isLoadingResenas = true

    this.resenaService
      .obtenerDestacadas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resenas: Resena[]) => {
          this.resenasDestacadas = resenas
          this.isLoadingResenas = false
        },
        error: (err: any) => {
          console.error('Error cargando reseñas:', err)
          this.isLoadingResenas = false
        }
      })
  }

  getEstrellas(calificacion: number): number[] {
    return Array(calificacion).fill(0)
  }
}
