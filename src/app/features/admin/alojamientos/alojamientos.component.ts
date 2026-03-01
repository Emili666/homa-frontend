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
}
