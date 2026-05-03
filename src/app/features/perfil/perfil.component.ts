import { Component, OnDestroy, OnInit, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Subject, of } from "rxjs";
import { finalize, switchMap, takeUntil } from "rxjs/operators";

import { AuthService } from "../../core/services/auth.service";
import { UsuarioService } from "../../core/services/usuario.service";
import { AlojamientoService, PageResponse } from "../../core/services/alojamiento.service";
import { ReservaService } from "../../core/services/reserva.service";
import { FavoritoService } from "../../core/services/favorito.service";
import { Usuario } from "../../core/models/usuario.model";
import { Alojamiento, EstadoAlojamiento, Servicio } from "../../core/models/alojamiento.model";
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
  profileError?: string;       // Error solo del perfil, no bloquea otras secciones
  reservasError?: string;      // Error de reservas
  alojamientosError?: string;  // Error de alojamientos
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
  isDeletingAlojamiento = false;
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

  // Modal de edición de alojamiento
  mostrarModalEditarAlojamiento = false;
  alojamientoEditando: Alojamiento | null = null;
  editAlojamientoForm!: FormGroup;
  isEditingAlojamiento = false;
  editAlojamientoError?: string;
  // Imágenes existentes (URLs de Cloudinary)
  imagenesExistentes: string[] = [];
  imagenesExistentesAEliminar: number[] = [];
  // Nuevas imágenes seleccionadas del PC
  imagenesNuevas: File[] = [];
  imagenesNuevasPreview: string[] = [];

  readonly serviciosDisponibles = [
    { id: Servicio.WIFI, label: 'WiFi', icon: 'fa-wifi' },
    { id: Servicio.PISCINA, label: 'Piscina', icon: 'fa-swimming-pool' },
    { id: Servicio.ESTACIONAMIENTO, label: 'Estacionamiento', icon: 'fa-car' },
    { id: Servicio.AIRE_ACONDICIONADO, label: 'Aire Acondicionado', icon: 'fa-snowflake' },
    { id: Servicio.COCINA, label: 'Cocina', icon: 'fa-utensils' },
    { id: Servicio.MASCOTAS, label: 'Mascotas permitidas', icon: 'fa-paw' },
    { id: Servicio.TV, label: 'TV', icon: 'fa-tv' },
    { id: Servicio.LAVADORA, label: 'Lavadora', icon: 'fa-tshirt' },
  ];

  readonly estadoHistorialCliente: Record<string, { title: string; helper: string }> = {
    PENDIENTE: {
      title: "Esperando confirmación",
      helper: "El anfitrión revisará tu solicitud. Te avisaremos cuando responda.",
    },
    CONFIRMADA: {
      title: "Reserva confirmada",
      helper: "Prepara tu viaje y revisa los detalles clave.",
    },
    RECHAZADA: {
      title: "Reserva rechazada",
      helper: "El anfitrión no pudo aceptar tu solicitud.",
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
    RECHAZADA: { label: "Rechazada", classes: "status-pill status-pill--danger" },
    CANCELADA: { label: "Cancelada", classes: "status-pill status-pill--neutral" },
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
    private route: ActivatedRoute,
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

    const section = this.route.snapshot.queryParamMap.get("section");
    if (section) {
      this.setActiveSection(section);
    }

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
    if (!user || !user.rol) return false;
    const rol = user.rol.toString().toUpperCase();
    return rol === 'ANFITRION' || rol === 'ADMINISTRADOR';
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
    this.profileError = undefined;

    // Intentar usar datos del cache local primero para carga rápida
    const cached = this.authService.currentUserValue;
    if (cached) {
      this.patchForms(cached);
    }

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
          this.profileError = undefined;
        },
        error: (err) => {
          // No seteamos this.error global para no bloquear TODO el perfil
          // Si tenemos datos del cache, los mostramos igualmente
          const msg = err?.error?.message || err?.message || 'Error al cargar el perfil';
          console.warn('[Perfil] Error al cargar desde backend:', msg);
          if (!cached) {
            this.profileError = "No se pudo cargar la información del perfil.";
          }
        },
      });
  }

  loadMisAlojamientos(page: number = 0, size: number = 10): void {
    this.isLoadingAlojamientos = true;
    this.alojamientosError = undefined;

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
          this.misAlojamientos = response.content.filter((alojamiento) => alojamiento.estado !== EstadoAlojamiento.ELIMINADO);
          this.totalAlojamientos = this.misAlojamientos.length;
          this.alojamientosError = undefined;
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Error';
          console.error('[Perfil] Error al cargar alojamientos:', msg);
          this.alojamientosError = "No se pudieron cargar tus alojamientos.";
        },
      });
  }

  eliminarAlojamiento(alojamientoId: number, titulo: string): void {
    const confirmacion = confirm(`¿Seguro que quieres eliminar "${titulo}"? Esta acción no se puede deshacer.`);
    if (!confirmacion) {
      return;
    }

    this.isDeletingAlojamiento = true;
    this.error = undefined;

    this.alojamientoService
      .eliminar(alojamientoId)
      .pipe(
        finalize(() => {
          this.isDeletingAlojamiento = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.loadMisAlojamientos();
        },
        error: (err) => {
          this.error = err?.error?.message || "No se pudo eliminar el alojamiento. Verifica si tiene reservas futuras.";
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;

    if (section === 'misAlojamientos' && this.isAnfitrion) {
      this.loadMisAlojamientos();
    }
    if (section === 'misReservas') {
      this.loadMisReservas();
    }
    if (section === 'reservasAnfitrion' && this.isAnfitrion) {
      this.loadReservasAnfitrion();
    }
    if (section === 'favoritosAlojamientos' && this.isAnfitrion) {
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
    this.reservasError = undefined;

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
          this.reservasError = undefined;
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Error';
          console.error('[Perfil] Error al cargar reservas:', msg);
          this.reservasError = "No se pudieron cargar tus reservas. Intenta nuevamente.";
        },
      });
  }

  loadReservasAnfitrion(): void {
    this.isLoadingReservasAnfitrion = true;
    this.error = undefined;

    this.reservaService
      .obtenerReservasAnfitrion()
      .pipe(
        finalize(() => { this.isLoadingReservasAnfitrion = false; }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (reservas: Reserva[]) => {
          this.reservasAnfitrion = reservas;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = "No se pudieron cargar las reservas de tus alojamientos.";
        },
      });
  }

  loadFavoritosAlojamientos(): void {
    this.isLoadingFavoritosAlojamientos = true;
    this.error = undefined;

    this.favoritoService
      .obtenerFavoritosDeAlojamientos()
      .pipe(
        finalize(() => { this.isLoadingFavoritosAlojamientos = false; }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (favoritos) => {
          this.favoritosAlojamientos = favoritos;
          this.cdr.detectChanges();
        },
        error: (err) => {
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

  get gananciasEsteMes(): number {
    const ahora = new Date();
    return this.reservasAnfitrion
      .filter(r => {
        if (r.estado !== 'COMPLETADA' && r.estado !== 'CONFIRMADA') return false;
        const fecha = new Date(r.fechaEntrada || r.creadoEn || '');
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      })
      .reduce((sum, r) => sum + (r.precio || 0), 0);
  }

  get promedioCalificacion(): number {
    const alojamientosConCalif = this.misAlojamientos.filter(a => a.calificacionPromedio && a.calificacionPromedio > 0);
    if (alojamientosConCalif.length === 0) return 0;
    const suma = alojamientosConCalif.reduce((s, a) => s + a.calificacionPromedio, 0);
    return Math.round((suma / alojamientosConCalif.length) * 10) / 10;
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

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }
    formData.append('nombre', this.personalForm.value.nombre);
    formData.append('email', this.personalForm.value.email);
    if (this.personalForm.value.telefono) {
      formData.append('telefono', this.personalForm.value.telefono);
    }

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
          this.previewUrl = usuario.foto || null;
        },
        error: () => {
          this.error = "No se pudieron guardar los cambios. Intenta nuevamente.";
        },
      });
  }

  private patchForms(usuario: Usuario): void {
    // Solo patcheamos campos que el backend realmente devuelve en UsuarioResponse
    // (id, nombre, email, telefono, foto, fechaNacimiento, estado, rol, esAnfitrion, creadoEn)
    this.personalForm.patchValue({
      nombre: usuario.nombre ?? "",
      email: usuario.email ?? "",
      telefono: usuario.telefono ?? "",
    });

    // Los formularios de preferencias y notificaciones no tienen datos reales del backend
    // Se mantienen con valores por defecto para no romper el template
    this.preferenciasForm.patchValue({
      idiomaPreferido: "",
      monedaPreferida: "",
      zonaHoraria: "",
    });

    this.notificacionesForm.patchValue({
      notificacionesEmail: false,
      notificacionesPush: false,
      recibirOfertas: false,
    });

    // Actualizar foto de perfil si existe
    if (usuario.foto) {
      this.previewUrl = usuario.foto;
    }
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
    this.reservaService.confirmar(reservaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadReservasAnfitrion();
          this.cerrarModalReserva();
        },
        error: (err) => {
          this.error = err.error?.message || 'No se pudo confirmar la reserva.';
        }
      });
  }

  rechazarReserva(reservaId: number): void {
    if (confirm('¿Estás seguro de que deseas rechazar esta reserva?')) {
      this.reservaService.rechazar(reservaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadReservasAnfitrion();
            this.cerrarModalReserva();
          },
          error: (err) => {
            this.error = err.error?.message || 'No se pudo rechazar la reserva.';
          }
        });
    }
  }

  completarReserva(reservaId: number): void {
    if (confirm('¿Confirmas que el huésped ya completó su estadía?')) {
      this.reservaService.completar(reservaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadReservasAnfitrion();
            this.cerrarModalReserva();
          },
          error: (err) => {
            this.error = err.error?.message || 'No se pudo completar la reserva.';
          }
        });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'PENDIENTE': 'bg-amber-100 text-amber-800',
      'CONFIRMADA': 'bg-blue-100 text-blue-800',
      'COMPLETADA': 'bg-green-100 text-green-800',
      'RECHAZADA': 'bg-rose-100 text-rose-800',
      'CANCELADA': 'bg-slate-100 text-slate-600',
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

  // ── Editar Alojamiento ────────────────────────────────────────────────────

  abrirModalEditarAlojamiento(alojamiento: Alojamiento): void {
    this.alojamientoEditando = alojamiento;
    this.editAlojamientoError = undefined;
    this.imagenesExistentes = [...(alojamiento.imagenes || [])];
    this.imagenesExistentesAEliminar = [];
    this.imagenesNuevas = [];
    this.imagenesNuevasPreview = [];

    this.editAlojamientoForm = this.fb.group({
      titulo: [alojamiento.titulo, [Validators.required, Validators.minLength(10), Validators.maxLength(150)]],
      descripcion: [alojamiento.descripcion, [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      ciudad: [alojamiento.ciudad, Validators.required],
      direccion: [alojamiento.direccion, Validators.required],
      latitud: [alojamiento.latitud, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: [alojamiento.longitud, [Validators.required, Validators.min(-180), Validators.max(180)]],
      precioPorNoche: [alojamiento.precioPorNoche, [Validators.required, Validators.min(0.01)]],
      maxHuespedes: [alojamiento.maxHuespedes, [Validators.required, Validators.min(1)]],
      servicios: [alojamiento.servicios || []],
    });

    this.mostrarModalEditarAlojamiento = true;
  }

  cerrarModalEditarAlojamiento(): void {
    this.mostrarModalEditarAlojamiento = false;
    this.alojamientoEditando = null;
    this.editAlojamientoError = undefined;
    this.imagenesNuevas = [];
    this.imagenesNuevasPreview = [];
    this.imagenesExistentesAEliminar = [];
  }

  marcarImagenExistenteParaEliminar(index: number): void {
    this.imagenesExistentes.splice(index, 1);
  }

  onFileSelectedEdit(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const totalActual = this.imagenesExistentes.length + this.imagenesNuevas.length;
    const disponibles = 10 - totalActual;
    Array.from(input.files).slice(0, disponibles).forEach(file => {
      this.imagenesNuevas.push(file);
      const reader = new FileReader();
      reader.onload = (e) => this.imagenesNuevasPreview.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  eliminarImagenNueva(index: number): void {
    this.imagenesNuevas.splice(index, 1);
    this.imagenesNuevasPreview.splice(index, 1);
  }

  isServicioEditSelected(servicio: Servicio): boolean {
    const servicios = this.editAlojamientoForm?.get('servicios')?.value as Servicio[] || [];
    return servicios.includes(servicio);
  }

  toggleServicioEdit(servicio: Servicio): void {
    const servicios = this.editAlojamientoForm.get('servicios')?.value as Servicio[] || [];
    const index = servicios.indexOf(servicio);
    if (index > -1) {
      servicios.splice(index, 1);
    } else {
      servicios.push(servicio);
    }
    this.editAlojamientoForm.patchValue({ servicios });
  }

  guardarEdicionAlojamiento(): void {
    if (!this.alojamientoEditando || this.editAlojamientoForm.invalid) {
      this.editAlojamientoForm.markAllAsTouched();
      return;
    }

    const totalImagenes = this.imagenesExistentes.length + this.imagenesNuevas.length;
    if (totalImagenes === 0) {
      this.editAlojamientoError = 'Debes tener al menos una imagen.';
      return;
    }

    this.isEditingAlojamiento = true;
    this.editAlojamientoError = undefined;

    const formData = { ...this.editAlojamientoForm.value, imagenes: this.imagenesExistentes };
    const id = this.alojamientoEditando.id;
    const imagenesNuevas = [...this.imagenesNuevas];

    this.alojamientoService.actualizar(id, formData).pipe(
      switchMap(() => {
        if (imagenesNuevas.length > 0) {
          return this.alojamientoService.subirImagenes(id, imagenesNuevas);
        }
        return of(null);
      }),
      finalize(() => { this.isEditingAlojamiento = false; }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.cerrarModalEditarAlojamiento();
        this.loadMisAlojamientos();
      },
      error: (err: any) => {
        this.editAlojamientoError = err?.error?.message || 'No se pudo actualizar el alojamiento.';
      }
    });
  }
}
