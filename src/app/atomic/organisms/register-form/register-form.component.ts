import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { RolUsuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  @Input() form!: FormGroup;
  @Input() submitLabel = 'Registrarse';
  @Input() loading = false;
  @Output() submitForm = new EventEmitter<void>();

  readonly roles = [
    {
      value: RolUsuario.HUESPED,
      label: 'Huésped',
      description: 'Reserva alojamientos y vive la experiencia HOMA',
    },
    {
      value: RolUsuario.ANFITRION,
      label: 'Anfitrión',
      description: 'Publica tus espacios y gestiona tus reservas',
    },
  ];

  onSubmit() {
    if (this.form.valid) this.submitForm.emit();
    else this.form.markAllAsTouched();
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  /** Returna 0-4 según la fortaleza de la contraseña */
  get passwordStrength(): number {
    const pwd: string = this.getControl('password')?.value ?? '';
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  }

  get passwordStrengthLabel(): string {
    const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    return labels[this.passwordStrength] ?? '';
  }

  get passwordStrengthClass(): string {
    const classes = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-600'];
    return classes[this.passwordStrength] ?? '';
  }

  get passwordStrengthBarClass(): string {
    const classes = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
    return classes[this.passwordStrength] ?? '';
  }

  // Métodos helper para el template (Angular no soporta /regex/ en templates HTML)
  passwordHasLength(min: number): boolean {
    return (this.getControl('password')?.value?.length ?? 0) >= min;
  }

  hasUppercase(): boolean {
    const pwd: string = this.getControl('password')?.value ?? '';
    return /[A-Z]/.test(pwd);
  }

  hasNumber(): boolean {
    const pwd: string = this.getControl('password')?.value ?? '';
    return /[0-9]/.test(pwd);
  }

  // Valor del control sin usar optional chaining en el template
  getControlValue(name: string): string {
    return this.getControl(name)?.value ?? '';
  }
}
