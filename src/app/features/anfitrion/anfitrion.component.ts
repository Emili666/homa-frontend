import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlojamientoService } from '../../core/services/alojamiento.service';
import { Servicio } from '../../core/models/alojamiento.model';

@Component({
  selector: 'app-anfitrion',
  templateUrl: './anfitrion.component.html',
  styleUrl: './anfitrion.component.scss'
})
export class AnfitrionComponent implements OnInit, OnDestroy {
  alojamientoForm: FormGroup;
  isSubmitting = false;
  error?: string;
  successMessage?: string;

  // Servicios disponibles
  serviciosDisponibles = [
    { id: Servicio.WIFI, label: 'WiFi', icon: 'fa-wifi' },
    { id: Servicio.PISCINA, label: 'Piscina', icon: 'fa-swimming-pool' },
    { id: Servicio.ESTACIONAMIENTO, label: 'Estacionamiento', icon: 'fa-car' },
    { id: Servicio.AIRE_ACONDICIONADO, label: 'Aire Acondicionado', icon: 'fa-snowflake' },
    { id: Servicio.COCINA, label: 'Cocina', icon: 'fa-utensils' },
    { id: Servicio.MASCOTAS, label: 'Mascotas permitidas', icon: 'fa-paw' },
    { id: Servicio.TV, label: 'TV', icon: 'fa-tv' },
    { id: Servicio.LAVADORA, label: 'Lavadora', icon: 'fa-tshirt' }
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private alojamientoService: AlojamientoService,
    private router: Router
  ) {
    this.alojamientoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(150)]],
      descripcion: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      ciudad: ['', Validators.required],
      direccion: ['', Validators.required],
      latitud: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      precioPorNoche: [null, [Validators.required, Validators.min(0.01)]],
      maxHuespedes: [1, [Validators.required, Validators.min(1)]],
      imagenes: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      servicios: [[]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get imagenes(): FormArray {
    return this.alojamientoForm.get('imagenes') as FormArray;
  }

  agregarImagen(): void {
    if (this.imagenes.length < 10) {
      this.imagenes.push(this.fb.control('', Validators.required));
    }
  }

  eliminarImagen(index: number): void {
    this.imagenes.removeAt(index);
  }

  toggleServicio(servicio: Servicio): void {
    const servicios = this.alojamientoForm.get('servicios')?.value as Servicio[] || [];
    const index = servicios.indexOf(servicio);

    if (index > -1) {
      servicios.splice(index, 1);
    } else {
      servicios.push(servicio);
    }

    this.alojamientoForm.patchValue({ servicios });
  }

  isServicioSelected(servicio: Servicio): boolean {
    const servicios = this.alojamientoForm.get('servicios')?.value as Servicio[] || [];
    return servicios.includes(servicio);
  }

  onSubmit(): void {
    if (this.alojamientoForm.invalid) {
      Object.keys(this.alojamientoForm.controls).forEach(key => {
        const control = this.alojamientoForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.isSubmitting = true;
    this.error = undefined;
    this.successMessage = undefined;

    const formData = this.alojamientoForm.value;

    this.alojamientoService
      .crear(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (alojamiento) => {
          this.successMessage = 'Alojamiento creado exitosamente';
          setTimeout(() => {
            this.router.navigate(['/perfil'], {
              queryParams: { section: 'misAlojamientos' }
            });
          }, 2000);
        },
        error: (err) => {
          this.error = err.error?.message || 'No se pudo crear el alojamiento. Intenta nuevamente.';
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/perfil'], {
      queryParams: { section: 'misAlojamientos' }
    });
  }
}
