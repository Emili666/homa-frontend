import { Component, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { FavoritoService } from '../../../../core/services/favorito.service'
import { BotonFavoritoComponent } from '../../../../shared/components/boton-favorito/boton-favorito.component'

@Component({
  selector: 'app-lista-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule, BotonFavoritoComponent],
  templateUrl: './lista-favoritos.component.html',
  styleUrl: './lista-favoritos.component.scss'
})
export class ListaFavoritosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()

  favoritos: any[] = []
  isLoading = false
  error?: string

  constructor(
    private favoritoService: FavoritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFavoritos()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  cargarFavoritos(): void {
    this.isLoading = true
    this.error = undefined

    this.favoritoService.obtenerMisFavoritos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // El backend devuelve un objeto paginado con { content: [...], totalElements, ... }
          console.log('✅ Respuesta completa del backend:', response)
          this.favoritos = response.content || response
          console.log('📋 Favoritos a mostrar:', this.favoritos)
          console.log('🔢 Cantidad de favoritos:', this.favoritos?.length)
          this.isLoading = false
        },
        error: (err) => {
          console.error('Error cargando favoritos:', err)
          this.error = 'No se pudieron cargar tus favoritos. Intenta nuevamente.'
          this.isLoading = false
        }
      })
  }

  verAlojamiento(id: number): void {
    this.router.navigate(['/alojamientos', id])
  }

  onFavoritoEliminado(): void {
    // Recargar la lista cuando se elimina un favorito
    this.cargarFavoritos()
  }
}
