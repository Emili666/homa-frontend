import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
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
  showSuccessOverlay = false;
  createdAlojamientoTitle = '';

  // Imágenes seleccionadas del PC
  imagenesSeleccionadas: File[] = [];
  imagenesPreview: string[] = [];

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
      servicios: [[]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Manejo de imágenes desde el PC ────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const nuevos = Array.from(input.files);
    const disponibles = 10 - this.imagenesSeleccionadas.length;
    nuevos.slice(0, disponibles).forEach(file => {
      this.imagenesSeleccionadas.push(file);
      const reader = new FileReader();
      reader.onload = (e) => this.imagenesPreview.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    input.value = ''; // Permite seleccionar el mismo archivo de nuevo
  }

  eliminarImagenSeleccionada(index: number): void {
    this.imagenesSeleccionadas.splice(index, 1);
    this.imagenesPreview.splice(index, 1);
  }

  // ── Servicios ─────────────────────────────────────────────────────────────

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

  // ── Submit: crear alojamiento y luego subir imágenes ──────────────────────

  onSubmit(): void {
    if (this.alojamientoForm.invalid) {
      Object.keys(this.alojamientoForm.controls).forEach(key => {
        this.alojamientoForm.get(key)?.markAsTouched();
      });
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    if (this.imagenesSeleccionadas.length === 0) {
      this.error = 'Debes seleccionar al menos una imagen';
      return;
    }

    this.isSubmitting = true;
    this.error = undefined;

    // Paso 1: crear alojamiento con imagenes vacías
    const formData = { ...this.alojamientoForm.value, imagenes: [] };

    this.alojamientoService.crear(formData).pipe(
      switchMap(alojamiento =>
        // Paso 2: subir imágenes al alojamiento creado
        this.alojamientoService.subirImagenes(alojamiento.id, this.imagenesSeleccionadas)
      ),
      finalize(() => { this.isSubmitting = false; }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.createdAlojamientoTitle = this.alojamientoForm.get('titulo')?.value || '';
        this.showSuccessOverlay = true;
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudo crear el alojamiento. Intenta nuevamente.';
      }
    });
  }

  irAMisAlojamientos(): void {
    this.router.navigate(['/perfil'], { queryParams: { section: 'misAlojamientos' } });
  }

  crearOtroAlojamiento(): void {
    this.showSuccessOverlay = false;
    this.error = undefined;
    this.createdAlojamientoTitle = '';
    this.imagenesSeleccionadas = [];
    this.imagenesPreview = [];
    this.alojamientoForm.reset({
      titulo: '', descripcion: '', ciudad: '', direccion: '',
      latitud: null, longitud: null, precioPorNoche: null,
      maxHuespedes: 1, servicios: []
    });
    this.alojamientoForm.markAsPristine();
    this.alojamientoForm.markAsUntouched();
  }

  cancel(): void {
    this.router.navigate(['/perfil'], { queryParams: { section: 'misAlojamientos' } });
  }
}
