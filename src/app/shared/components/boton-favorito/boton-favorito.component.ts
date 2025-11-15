import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FavoritoService } from '../../../core/services/favorito.service'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'app-boton-favorito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boton-favorito.component.html',
  styleUrl: './boton-favorito.component.scss'
})
export class BotonFavoritoComponent implements OnInit {
  @Input() alojamientoId!: number
  @Input() showLabel: boolean = false

  esFavorito = false
  isLoading = false
  isAuthenticated = false

  constructor(
    private favoritoService: FavoritoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated

    if (this.isAuthenticated && this.alojamientoId) {
      this.verificarFavorito()
    }
  }

  verificarFavorito(): void {
    this.favoritoService.esFavorito(this.alojamientoId).subscribe({
      next: (result) => {
        this.esFavorito = result
      },
      error: (err) => {
        console.error('Error verificando favorito:', err)
      }
    })
  }

  toggleFavorito(event: Event): void {
    event.preventDefault()
    event.stopPropagation()

    if (!this.isAuthenticated) {
      alert('Debes iniciar sesión para agregar favoritos')
      return
    }

    if (this.isLoading) return

    this.isLoading = true

    if (this.esFavorito) {
      this.eliminarFavorito()
    } else {
      this.agregarFavorito()
    }
  }

  private agregarFavorito(): void {
    this.favoritoService.agregarFavorito(this.alojamientoId).subscribe({
      next: () => {
        this.esFavorito = true
        this.isLoading = false
      },
      error: (err) => {
        console.error('Error agregando favorito:', err)
        this.isLoading = false
        alert('No se pudo agregar a favoritos')
      }
    })
  }

  private eliminarFavorito(): void {
    this.favoritoService.eliminarFavorito(this.alojamientoId).subscribe({
      next: () => {
        this.esFavorito = false
        this.isLoading = false
      },
      error: (err) => {
        console.error('Error eliminando favorito:', err)
        this.isLoading = false
        alert('No se pudo eliminar de favoritos')
      }
    })
  }
}
