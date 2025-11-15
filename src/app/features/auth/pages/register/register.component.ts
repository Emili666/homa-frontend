import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";

import { AuthService } from "../../../../core/services/auth.service";
import { RolUsuario } from "../../../../core/models/usuario.model";

@Component({
  selector: "app-register-page",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterPageComponent implements OnDestroy {
  form: FormGroup;
  error?: string;
  successMessage?: string;
  isLoading = false;
  private redirectTimeoutId?: ReturnType<typeof setTimeout>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      nombre: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ["", [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z]).*$/)
      ]],
      confirmPassword: ["", [Validators.required]],
      rol: [RolUsuario.HUESPED, [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnDestroy(): void {
    this.clearRedirectTimeout();
  }

  // Validador personalizado para verificar que las contrasenas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, email, password, rol } = this.form.value as {
      nombre: string;
      email: string;
      password: string;
      rol: RolUsuario;
    };
    const selectedRol = rol ?? RolUsuario.HUESPED;

    // Flujo real contra backend - enviar valores por defecto para campos opcionales
    this.isLoading = true;
    this.error = undefined;
    this.successMessage = undefined;
    this.clearRedirectTimeout();
    this.auth
      .register({
        nombre,
        email,
        telefono: "0000000000", // valor por defecto temporal
        fechaNacimiento: "2000-01-01", // valor por defecto temporal
        contrasena: password,
        rol: this.mapRolToApi(selectedRol),
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.error = undefined;
          this.successMessage = "Registro exitoso. Te redirigiremos al inicio de sesion en unos segundos.";
          this.redirectTimeoutId = setTimeout(() => {
            this.router.navigate(["/auth/login"]);
          }, 2500);
        },
        error: (err) => {
          const message =
            err?.error?.message ?? err?.message ?? "Error al registrar usuario. Intenta de nuevo.";
          this.error = message;
          this.successMessage = undefined;
        },
      });
  }

  goToLogin(): void {
    this.clearRedirectTimeout();
    this.router.navigate(["/auth/login"]);
  }

  private mapRolToApi(rol: RolUsuario): "Huesped" | "Anfitrion" {
    if (rol === RolUsuario.ANFITRION) {
      return "Anfitrion";
    }

    return "Huesped";
  }

  private clearRedirectTimeout(): void {
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
      this.redirectTimeoutId = undefined;
    }
  }
}
