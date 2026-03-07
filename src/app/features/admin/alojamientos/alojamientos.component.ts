import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlojamientoService } from '../../../core/services/alojamiento.service';

@Component({
  selector: 'app-alojamientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alojamientos.component.html',
  styleUrl: './alojamientos.component.scss'
})
export class AlojamientosComponent implements OnInit {
  alojamientos: any[] = [];
  loading = false;

  constructor(private alojamientoService: AlojamientoService) { }

  ngOnInit(): void {
    this.cargarAlojamientos();
  }

  cargarAlojamientos(): void {
    this.loading = true;
    this.alojamientoService.listarTodos().subscribe({
      next: (response) => {
        // En un PageResponse, los datos están en 'content'
        this.alojamientos = response.content || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar alojamientos:', err);
        this.loading = false;
      }
    });
  }

  getImagen(alojamiento: any): string {
    if (alojamiento.imagenes && alojamiento.imagenes.length > 0) {
      const url = alojamiento.imagenes[0];
      // Si ya es una URL completa o base64
      if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
      }
      // Dependiendo de tu backend (S3, VPS local, etc.), podrías necesitar concatenar la base
      // return `https://tu-dominio.com/uploads/${url}`;
      return url;
    }
    return 'https://via.placeholder.com/150';
  }

  verDetalle(id: number): void {
    console.log('Ver detalle del alojamiento:', id);
    // this.router.navigate(['/admin/alojamientos', id]);
    alert('Esta función abrirá los detalles del alojamiento con ID: ' + id);
  }

  editarAlojamiento(id: number): void {
    console.log('Editar alojamiento:', id);
    // this.router.navigate(['/admin/alojamientos/editar', id]);
    alert('Esta función abrirá el editor para el alojamiento con ID: ' + id);
  }

  eliminarAlojamiento(id: number, titulo: string): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el alojamiento "${titulo}"?`)) {
      this.alojamientoService.eliminar(id).subscribe({
        next: () => {
          this.alojamientos = this.alojamientos.filter(a => a.id !== id);
          alert('Alojamiento eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('Error al intentar eliminar el alojamiento.');
        }
      });
    }
  }
}
