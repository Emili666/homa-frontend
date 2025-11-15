import { Component, OnDestroy } from "@angular/core"
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms"
import { Subject } from "rxjs"
import { finalize, takeUntil } from "rxjs/operators"

import { UsuarioService } from "@core/services/usuario.service"

@Component({
  selector: "app-password-recovery-page",
  templateUrl: "./password-recovery.component.html",
  styleUrls: ["./password-recovery.component.scss"],
})
export class PasswordRecoveryPageComponent implements OnDestroy {
  requestForm: FormGroup
  resetForm: FormGroup

  isRequestingCode = false
  isResettingPassword = false
  codeRequested = false
  successMessage?: string
  errorMessage?: string
  lastEmailUsed?: string
  codigoExpiraEn?: Date

  private readonly destroy$ = new Subject<void>()

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
    this.requestForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })

    this.resetForm = this.fb.group(
      {
        codigo: ["", [Validators.required, Validators.minLength(6)]],
        nuevaContrasena: ["", [Validators.required, Validators.minLength(8)]],
        confirmarContrasena: ["", [Validators.required]],
      },
      {
        validators: this.passwordsMatchValidator("nuevaContrasena", "confirmarContrasena"),
      },
    )
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get emailControl(): FormControl {
    return this.requestForm.get("email") as FormControl
  }

  getResetControl(controlName: string): FormControl {
    return this.resetForm.get(controlName) as FormControl
  }

  onSendRecoveryCode(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched()
      return
    }

    const { email } = this.requestForm.value as { email: string }
    this.isRequestingCode = true
    this.errorMessage = undefined
    this.successMessage = undefined

    this.usuarioService
      .recuperarContrasena(email)
      .pipe(
        finalize(() => (this.isRequestingCode = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.codeRequested = true
          this.lastEmailUsed = email
          this.codigoExpiraEn = new Date(Date.now() + 15 * 60 * 1000)
          this.successMessage =
            "Te enviamos un código de recuperación a tu correo. Revisa la bandeja de entrada o el spam."
          this.errorMessage = undefined
        },
        error: (err) => {
          this.successMessage = undefined
          this.errorMessage = err?.error?.message || "No pudimos enviar el código. Intenta nuevamente."
        },
      })
  }

  onResetPassword(): void {
    if (!this.codeRequested) {
      this.errorMessage = "Primero debes solicitar un código de recuperación."
      return
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched()
      return
    }

    const { codigo, nuevaContrasena } = this.resetForm.value as { codigo: string; nuevaContrasena: string }
    this.isResettingPassword = true
    this.errorMessage = undefined
    this.successMessage = undefined

    this.usuarioService
      .restablecerContrasena(codigo, nuevaContrasena)
      .pipe(
        finalize(() => (this.isResettingPassword = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.successMessage = "¡Listo! Tu contraseña fue restablecida. Ya puedes iniciar sesión con ella."
          this.resetForm.reset()
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || "No pudimos restablecer tu contraseña. Verifica el código."
        },
      })
  }

  resendCode(): void {
    if (!this.lastEmailUsed) {
      this.requestForm.markAllAsTouched()
      this.errorMessage = "Ingresa tu correo para solicitar un código."
      return
    }

    this.requestForm.patchValue({ email: this.lastEmailUsed })
    this.onSendRecoveryCode()
  }

  private passwordsMatchValidator(passwordKey: string, confirmationKey: string) {
    return (group: FormGroup) => {
      const passwordControl = group.get(passwordKey)
      const confirmationControl = group.get(confirmationKey)

      if (!passwordControl || !confirmationControl) {
        return null
      }

      if (confirmationControl.errors && !confirmationControl.errors["passwordMismatch"]) {
        return null
      }

      if (passwordControl.value !== confirmationControl.value) {
        confirmationControl.setErrors({ passwordMismatch: true })
      } else {
        confirmationControl.setErrors(null)
      }

      return null
    }
  }
}
