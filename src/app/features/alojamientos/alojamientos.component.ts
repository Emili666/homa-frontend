import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AlojamientoService } from '../../core/services/alojamiento.service';
import { Alojamiento } from '../../core/models/alojamiento.model';

@Component({
  selector: 'app-alojamientos',
  templateUrl: './alojamientos.component.html',
  styleUrls: ['./alojamientos.component.scss']
})
export class AlojamientosComponent implements OnInit, OnDestroy {
  alojamientos: Alojamiento[] = [];
  isLoading = false;
  error?: string;
  totalElements = 0;

  private destroy$ = new Subject<void>();

  constructor(private alojamientoService: AlojamientoService) {}

  ngOnInit(): void {
    this.cargarAlojamientos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarAlojamientos(): void {
    this.isLoading = true;
    this.error = undefined;

    this.alojamientoService
      .buscar({ page: 0, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.alojamientos = response.content;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error cargando alojamientos:', err);
          this.error = 'No se pudieron cargar los alojamientos. Intenta nuevamente.';
          this.isLoading = false;
        }
      });
  }
}
