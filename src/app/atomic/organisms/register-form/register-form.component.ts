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
  @Output() submitForm = new EventEmitter<void>();
  readonly roles = [
    {
      value: RolUsuario.HUESPED,
      label: 'Huesped',
      description: 'Reserva alojamientos y vive la experiencia HOMA',
    },
    {
      value: RolUsuario.ANFITRION,
      label: 'Anfitrion',
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
}
