import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";

import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-login-page",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginPageComponent {
  form: FormGroup;
  error?: string;
  isLoading = false;
  siteKey = '1x00000000000000000000AA'; // Dummy testing key
  captchaToken: string | null = null;
  readonly demoUser = { username: "demo@correo.com", password: "123456" };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      username: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.captchaToken) {
      this.error = "Por favor, completa el Captcha de seguridad.";
      return;
    }

    const { username, password } = this.form.value as { username: string; password: string };

    // Demo local: si son credenciales demo, no llamar backend
    if (username === this.demoUser.username && password === this.demoUser.password) {
      this.auth.mockLogin();
      this.error = undefined;
      this.router.navigate(["/"]);
      return;
    }

    // Flujo real contra backend
    this.isLoading = true;
    this.error = undefined;
    this.auth
      .login({ email: username, contrasena: password })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.error = undefined;
          if (response?.usuario) {
            this.auth.updateCurrentUser(response.usuario);
          }
          this.router.navigate(["/"]);
        },
        error: (err) => {
          const message =
            err?.error?.message ?? err?.message ?? "Usuario o contrasena incorrectos. Vuelve a intentarlo.";
          this.error = message;
        },
      });
  }

  onCaptchaResolved(token: string) {
    this.captchaToken = token;
    this.error = undefined;
  }

  onForgotPassword(): void {
    this.router.navigate(["/auth/recuperar"])
  }

  goToRegister(): void {
    this.router.navigate(["/auth/register"]);
  }
}
