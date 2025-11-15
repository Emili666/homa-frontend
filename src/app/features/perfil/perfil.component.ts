import { Component, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

import { AuthService } from "../../core/services/auth.service";
import { UsuarioService } from "../../core/services/usuario.service";
import { AlojamientoService, PageResponse } from "../../core/services/alojamiento.service";
import { ReservaService } from "../../core/services/reserva.service";
import { FavoritoService } from "../../core/services/favorito.service";
import { Usuario } from "../../core/models/usuario.model";
import { Alojamiento, EstadoAlojamiento } from "../../core/models/alojamiento.model";
import { Reserva } from "../../core/models/reserva.model";

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.component.html",
  styleUrls: ["./perfil.component.scss"],
})
export class PerfilComponent implements OnInit, OnDestroy {
  personalForm: FormGroup;
  preferenciasForm: FormGroup;
  notificacionesForm: FormGroup;
  cambioContrasenaForm: FormGroup;
  isLoading = false;
  error?: string;
  isEditMode = false;
  isSaving = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isChangingPassword = false;
  passwordChangeSuccess?: string;
  passwordChangeError?: string;

  activeSection: string = "myProfile";

  // Datos de alojamientos reales
  misAlojamientos: Alojamiento[] = [];
  isLoadingAlojamientos = false;
  totalAlojamientos = 0;

  // Datos de reservas reales
  misReservas: Reserva[] = [];
  isLoadingReservas = false;

  // Reservas del anfitrión (de sus alojamientos)
  reservasAnfitrion: Reserva[] = [];
  isLoadingReservasAnfitrion = false;

  // Favoritos de los alojamientos del anfitrión
  favoritosAlojamientos: any[] = [];
  isLoadingFavoritosAlojamientos = false;

  // Modal de detalle de reserva
  mostrarModalReserva = false;
  reservaSeleccionada: Reserva | null = null;

  readonly estadoHistorialCliente: Record<string, { title: string; helper: string }> = {
    PENDIENTE: {
      title: "Esperando confirmacion",
      helper: "Te avisaremos cuando el anfitrion responda.",
    },
    CONFIRMADA: {
      title: "Reserva confirmada",
      helper: "Prepara tu viaje y revisa los detalles clave.",
    },
    CANCELADA: {
      title: "Reserva cancelada",
      helper: "Puedes crear una nueva reserva cuando quieras.",
    },
    COMPLETADA: {
      title: "Estadia completada",
      helper: "Comparte tu experiencia con una resena.",
    },
  };

  readonly estadoHistorialHost: Record<string, { label: string; classes: string }> = {
    PENDIENTE: { label: "Pendiente", classes: "status-pill status-pill--pending" },
    CONFIRMADA: { label: "Confirmada", classes: "status-pill status-pill--info" },
    CANCELADA: { label: "Cancelada", classes: "status-pill status-pill--danger" },
    COMPLETADA: { label: "Completada", classes: "status-pill status-pill--success" },
  };

  readonly estadoAlojamientoBadges: Record<string, { label: string; classes: string }> = {
    [EstadoAlojamiento.PENDIENTE]: {
      label: "En revision",
      classes: "status-pill status-pill--pending",
    },
    [EstadoAlojamiento.ACTIVO]: {
      label: "Activo",
      classes: "status-pill status-pill--success",
    },
    [EstadoAlojamiento.INACTIVO]: {
      label: "Pausado",
      classes: "status-pill status-pill--neutral",
    },
    [EstadoAlojamiento.ELIMINADO]: {
      label: "Retirado",
      classes: "status-pill status-pill--danger",
    },
  };

  readonly idiomas = [
    { id: "es", label: "Espanol" },
    { id: "en", label: "English" },
    { id: "pt", label: "Portugues" },
  ];

  readonly monedas = [
    { id: "COP", label: "COP - Peso colombiano" },
    { id: "USD", label: "USD - Dolar estadounidense" },
    { id: "EUR", label: "EUR - Euro" },
  ];

  readonly zonasHorarias = [
    { id: "America/Bogota", label: "Bogota, Lima, Quito (UTC-5)" },
    { id: "America/New_York", label: "Nueva York (UTC-4)" },
    { id: "Europe/Madrid", label: "Madrid (UTC+2)" },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private alojamientoService: AlojamientoService,
    private reservaService: ReservaService,
    private favoritoService: FavoritoService,
    private cdr: ChangeDetectorRef,
  ) {
    this.personalForm = this.fb.group({
      nombre: [""],
      email: [""],
      telefono: [""],
    });

    this.preferenciasForm = this.fb.group({
      idiomaPreferido: [""],
      monedaPreferida: [""],
      zonaHoraria: [""],
    });

    this.cambioContrasenaForm = this.fb.group(
      {
        contrasenaActual: ["", [Validators.required]],
        contrasenaNueva: ["", [Validators.required, Validators.minLength(8)]],
        confirmarContrasena: ["", [Validators.required]],
      },
      {
        validators: this.passwordsMatchValidator("contrasenaNueva", "confirmarContrasena"),
      },
    );

    this.notificacionesForm = this.fb.group({
      notificacionesEmail: [false],
      notificacionesPush: [false],
      recibirOfertas: [false],
    });
  }

  ngOnInit(): void {
    const cachedUser = this.authService.currentUserValue;
    if (cachedUser) {
      this.patchForms(cachedUser);
    }

    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((usuario) => {
      if (usuario) {
        this.patchForms(usuario);
      }
    });

    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayName(): string {
    const { nombre, apellido } = this.personalForm.value;
    const parts = [nombre, apellido].filter((value) => !!value && value.trim().length > 0);
    return parts.join(" ") || nombre || "";
  }

  get displayEmail(): string {
    return this.personalForm.get("email")?.value ?? "";
  }

  get isAnfitrion(): boolean {
    const user = this.authService.currentUserValue;
    console.log('Verificando si es anfitrion:', user);
    if (!user || !user.rol) {
      console.log('No hay usuario o no tiene rol');
      return false;
    }
    const esAnfitrion = user.rol.toString().toUpperCase() === 'ANFITRION' ||
           user.rol.toString().toUpperCase() === 'ADMIN';
    console.log('Es anfitrion?', esAnfitrion, 'Rol:', user.rol);
    return esAnfitrion;
  }

  get currentUser(): Usuario | null {
    return this.authService.currentUserValue;
  }

  getSectionTitle(): string {
    const titles: { [key: string]: string } = {
      myProfile: 'Mi Perfil',
      misAlojamientos: 'Panel de Anfitrión',
      misReservas: 'Mis Reservas',
      reservasAnfitrion: 'Reservas de Mis Alojamientos',
      favoritosAlojamientos: 'Usuarios que Favoritearon Mis Alojamientos',
      favorites: 'Favoritos',
      history: 'Historial',
      settings: 'Configuración'
    };
    return titles[this.activeSection] || 'Mi Perfil';
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = undefined;

    this.usuarioService
      .obtenerPerfil()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (usuario) => {
          this.patchForms(usuario);
          this.authService.updateCurrentUser(usuario);
        },
        error: () => {
          this.error = "No se pudo cargar la informacion del perfil. Intenta nuevamente.";
        },
      });
  }

  loadMisAlojamientos(page: number = 0, size: number = 10): void {
    this.isLoadingAlojamientos = true;
    this.error = undefined;

    this.alojamientoService
      .obtenerMisAlojamientos(page, size)
      .pipe(
        finalize(() => {
          this.isLoadingAlojamientos = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: PageResponse<Alojamiento>) => {
          this.misAlojamientos = response.content;
          this.totalAlojamientos = response.totalElements;
        },
        error: () => {
          this.error = "No se pudieron cargar tus alojamientos. Intenta nuevamente.";
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }

  setActiveSection(section: string): void {
    console.log('=== CAMBIANDO SECCION ===');
    console.log('Nueva seccion:', section);
    this.activeSection = section;
    console.log('activeSection actualizado:', this.activeSection);

    // Cargar alojamientos cuando se selecciona la sección de Mis Alojamientos
    if (section === 'misAlojamientos' && this.isAnfitrion) {
      this.loadMisAlojamientos();
    }

    // Cargar reservas cuando se selecciona la sección de Mis Reservas
    if (section === 'misReservas') {
      this.loadMisReservas();
    }

    // Cargar reservas del anfitrión cuando se selecciona esa sección
    if (section === 'reservasAnfitrion' && this.isAnfitrion) {
      console.log('Condicion cumplida: cargando reservas anfitrion');
      this.loadReservasAnfitrion();
    }

    // Cargar favoritos de alojamientos cuando se selecciona esa sección
    if (section === 'favoritosAlojamientos' && this.isAnfitrion) {
      console.log('Condicion cumplida: cargando favoritos alojamientos');
      this.loadFavoritosAlojamientos();
    }

    if (section === 'history') {
      this.loadMisReservas();

      if (this.isAnfitrion) {
        this.loadReservasAnfitrion();
        this.loadMisAlojamientos();
      }
    }

    if (section === 'settings') {
      this.passwordChangeError = undefined;
      this.passwordChangeSuccess = undefined;
    }
  }

  loadMisReservas(): void {
    this.isLoadingReservas = true;
    this.error = undefined;

    this.reservaService
      .obtenerMisReservas()
      .pipe(
        finalize(() => {
          this.isLoadingReservas = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (reservas: Reserva[]) => {
          this.misReservas = reservas;
        },
        error: () => {
          this.error = "No se pudieron cargar tus reservas. Intenta nuevamente.";
        },
      });
  }

  loadReservasAnfitrion(): void {
    console.log('=== CARGANDO RESERVAS ANFITRION ===');
    this.isLoadingReservasAnfitrion = true;
    this.error = undefined;

    this.reservaService
      .obtenerReservasAnfitrion()
      .pipe(
        finalize(() => {
          console.log('Finalizando carga de reservas anfitrion');
          this.isLoadingReservasAnfitrion = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (reservas: Reserva[]) => {
          console.log('Reservas recibidas:', reservas);
          console.log('Cantidad de reservas:', reservas.length);
          this.reservasAnfitrion = reservas;
          this.cdr.detectChanges();
          console.log('Change detection forzada. Array actualizado:', this.reservasAnfitrion.length);
        },
        error: (err) => {
          console.error('ERROR al cargar reservas anfitrion:', err);
          this.error = "No se pudieron cargar las reservas de tus alojamientos. Intenta nuevamente.";
        },
      });
  }

  loadFavoritosAlojamientos(): void {
    console.log('=== CARGANDO FAVORITOS DE ALOJAMIENTOS ===');
    this.isLoadingFavoritosAlojamientos = true;
    this.error = undefined;

    this.favoritoService
      .obtenerFavoritosDeAlojamientos()
      .pipe(
        finalize(() => {
          this.isLoadingFavoritosAlojamientos = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (favoritos) => {
          console.log('Favoritos recibidos:', favoritos);
          this.favoritosAlojamientos = favoritos;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ERROR al cargar favoritos:', err);
          this.error = "No se pudieron cargar los favoritos de tus alojamientos.";
        },
      });
  }

  get historialReservasCliente(): Reserva[] {
    return this.ordenarReservasPorFecha(this.misReservas).slice(0, 4);
  }

  get historialReservasAnfitrion(): Reserva[] {
    return this.ordenarReservasPorFecha(this.reservasAnfitrion).slice(0, 4);
  }

  get historialAlojamientosRecientes(): Alojamiento[] {
    return [...this.misAlojamientos]
      .sort((a, b) => this.obtenerTimestamp(b.creadoEn) - this.obtenerTimestamp(a.creadoEn))
      .slice(0, 4);
  }

  get totalReservasClienteActivas(): number {
    return this.misReservas.filter(
      (reserva) => reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA',
    ).length;
  }

  get totalReservasClienteCompletadas(): number {
    return this.misReservas.filter((reserva) => reserva.estado === 'COMPLETADA').length;
  }

  get totalReservasHostActivas(): number {
    return this.reservasAnfitrion.filter(
      (reserva) => reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA',
    ).length;
  }

  get totalReservasHostCompletadas(): number {
    return this.reservasAnfitrion.filter((reserva) => reserva.estado === 'COMPLETADA').length;
  }

  getEstadoClienteTitulo(estado: string): string {
    return this.estadoHistorialCliente[estado]?.title || 'Estado de la reserva';
  }

  getEstadoClienteHelper(estado: string): string {
    return this.estadoHistorialCliente[estado]?.helper || '';
  }

  getEstadoHostLabel(estado: string): string {
    return this.estadoHistorialHost[estado]?.label || estado;
  }

  getEstadoHostClasses(estado: string): string {
    return this.estadoHistorialHost[estado]?.classes || 'status-pill';
  }

  getEstadoAlojamientoLabel(estado?: EstadoAlojamiento): string {
    if (!estado) {
      return 'Sin estado';
    }
    return this.estadoAlojamientoBadges[estado]?.label || estado;
  }

  getEstadoAlojamientoClasses(estado?: EstadoAlojamiento): string {
    if (!estado) {
      return 'status-pill';
    }
    return this.estadoAlojamientoBadges[estado]?.classes || 'status-pill';
  }

  trackByReservaId(_index: number, reserva: Reserva): number {
    return reserva.id;
  }

  trackByAlojamientoId(_index: number, alojamiento: Alojamiento): number {
    return alojamiento.id;
  }

  private ordenarReservasPorFecha(reservas: Reserva[]): Reserva[] {
    return [...reservas].sort(
      (a, b) => this.obtenerTimestamp(this.obtenerFechaReserva(b)) - this.obtenerTimestamp(this.obtenerFechaReserva(a)),
    );
  }

  private obtenerFechaReserva(reserva: Reserva): string | undefined {
    return reserva.creadoEn || reserva.fechaCreacion || reserva.fechaEntrada;
  }

  private obtenerTimestamp(fecha?: string): number {
    if (!fecha) {
      return 0;
    }
    const parsed = Date.parse(fecha);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  onSubmitCambioContrasena(): void {
    if (this.cambioContrasenaForm.invalid) {
      this.cambioContrasenaForm.markAllAsTouched();
      return;
    }

    const { contrasenaActual, contrasenaNueva } = this.cambioContrasenaForm.value as {
      contrasenaActual: string;
      contrasenaNueva: string;
    };

    this.isChangingPassword = true;
    this.passwordChangeError = undefined;
    this.passwordChangeSuccess = undefined;

    this.usuarioService
      .cambiarContrasena(contrasenaActual, contrasenaNueva)
      .pipe(
        finalize(() => {
          this.isChangingPassword = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.passwordChangeSuccess = "Actualizamos tu contraseña correctamente.";
          this.cambioContrasenaForm.reset();
        },
        error: (err) => {
          this.passwordChangeError =
            err?.error?.message || "No pudimos cambiar tu contraseña. Verifica los datos e intenta nuevamente.";
        },
      });
  }

  private passwordsMatchValidator(passwordField: string, confirmationField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const passwordControl = formGroup.get(passwordField);
      const confirmationControl = formGroup.get(confirmationField);

      if (!passwordControl || !confirmationControl) {
        return null;
      }

      if (confirmationControl.errors && !confirmationControl.errors["passwordMismatch"]) {
        return null;
      }

      if (passwordControl.value !== confirmationControl.value) {
        confirmationControl.setErrors({ passwordMismatch: true });
      } else {
        confirmationControl.setErrors(null);
      }

      return null;
    };
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Si cancela, recargar los datos originales
      const cachedUser = this.authService.currentUserValue;
      if (cachedUser) {
        this.patchForms(cachedUser);
      }
      // Limpiar foto seleccionada
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar los 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = undefined;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  saveProfile(): void {
    if (this.personalForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.error = undefined;

    const onPerfilActualizado = (usuario: Usuario) => {
      this.patchForms(usuario);
      this.authService.updateCurrentUser(usuario);
      this.isEditMode = false;
    };

    // Si hay una foto seleccionada, usar FormData
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('foto', this.selectedFile);
      formData.append('nombre', this.personalForm.value.nombre);
      formData.append('email', this.personalForm.value.email);
      formData.append('telefono', this.personalForm.value.telefono || '');

      this.usuarioService
        .actualizarPerfilConFoto(formData)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (usuario) => {
            onPerfilActualizado(usuario);
            this.selectedFile = null;
            this.previewUrl = null;
          },
          error: () => {
            this.error = "No se pudieron guardar los cambios. Intenta nuevamente.";
          },
        });
    } else {
      // Sin foto, enviar JSON normal
      const updatedData: any = {
        nombre: this.personalForm.value.nombre,
        email: this.personalForm.value.email,
        telefono: this.personalForm.value.telefono,
      };

      this.usuarioService
        .actualizarPerfil(updatedData)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (usuario) => {
            onPerfilActualizado(usuario);
          },
          error: () => {
            this.error = "No se pudieron guardar los cambios. Intenta nuevamente.";
          },
        });
    }
  }

  private patchForms(usuario: Usuario): void {
    this.personalForm.patchValue({
      nombre: usuario.nombre ?? "",
      email: usuario.email ?? "",
      telefono: usuario.telefono ?? "",
    });

    this.preferenciasForm.patchValue({
      idiomaPreferido: usuario.idiomaPreferido ?? "",
      monedaPreferida: usuario.monedaPreferida ?? "",
      zonaHoraria: usuario.zonaHoraria ?? "",
    });

    this.notificacionesForm.patchValue({
      notificacionesEmail: usuario.notificacionesEmail ?? false,
      notificacionesPush: usuario.notificacionesPush ?? false,
      recibirOfertas: usuario.recibirOfertas ?? false,
    });
  }

  // Métodos para el modal de detalle de reserva
  verDetalleReserva(reserva: Reserva): void {
    console.log('Abriendo detalle de reserva:', reserva);
    this.reservaSeleccionada = reserva;
    this.mostrarModalReserva = true;
  }

  cerrarModalReserva(): void {
    this.mostrarModalReserva = false;
    this.reservaSeleccionada = null;
  }

  confirmarReserva(reservaId: number): void {
    console.log('Confirmando reserva ID:', reservaId);

    this.reservaService.confirmar(reservaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Reserva confirmada exitosamente');
          alert('Reserva confirmada exitosamente');
          this.loadReservasAnfitrion();
          this.cerrarModalReserva();
        },
        error: (err) => {
          console.error('Error al confirmar reserva:', err);
          this.error = err.error?.message || 'No se pudo confirmar la reserva. Intenta nuevamente.';
        }
      });
  }

  rechazarReserva(reservaId: number): void {
    console.log('Rechazando reserva ID:', reservaId);

    if (confirm('¿Estás seguro de que deseas rechazar esta reserva?')) {
      this.reservaService.rechazar(reservaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Reserva rechazada exitosamente');
            alert('Reserva rechazada exitosamente');
            this.loadReservasAnfitrion();
            this.cerrarModalReserva();
          },
          error: (err) => {
            console.error('Error al rechazar reserva:', err);
            this.error = err.error?.message || 'No se pudo rechazar la reserva. Intenta nuevamente.';
          }
        });
    }
  }

  completarReserva(reservaId: number): void {
    console.log('Completando reserva ID:', reservaId);

    if (confirm('¿Confirmas que el huésped ya completó su estadía?')) {
      this.reservaService.completar(reservaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Reserva completada exitosamente');
            alert('Reserva marcada como completada. Ahora el huésped puede dejar una reseña.');
            this.loadReservasAnfitrion();
            this.cerrarModalReserva();
          },
          error: (err) => {
            console.error('Error al completar reserva:', err);
            this.error = err.error?.message || 'No se pudo completar la reserva. Intenta nuevamente.';
          }
        });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMADA': 'bg-blue-100 text-blue-800',
      'COMPLETADA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800'
    };
    return clases[estado] || 'bg-gray-100 text-gray-800';
  }

  puedeConfirmar(reserva: Reserva): boolean {
    return reserva.estado === 'PENDIENTE';
  }

  puedeCompletar(reserva: Reserva): boolean {
    return reserva.estado === 'CONFIRMADA';
  }

  puedeRechazar(reserva: Reserva): boolean {
    return reserva.estado === 'PENDIENTE';
  }
}
