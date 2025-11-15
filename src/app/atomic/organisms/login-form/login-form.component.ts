import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  @Input() form!: FormGroup;
  @Input() submitLabel = 'Ingresar';
  @Output() submitForm = new EventEmitter<void>();
  @Output() forgotPassword = new EventEmitter<void>();

  onSubmit() {
    if (this.form.valid) this.submitForm.emit();
    else this.form.markAllAsTouched();
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }
}
