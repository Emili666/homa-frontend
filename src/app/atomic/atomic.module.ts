import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from './atoms/button/button.component';
import { InputComponent } from './atoms/input/input.component';
import { LabelComponent } from './atoms/label/label.component';
import { FormFieldComponent } from './molecules/form-field/form-field.component';
import { LoginFormComponent } from './organisms/login-form/login-form.component';
import { RegisterFormComponent } from './organisms/register-form/register-form.component';
import { AuthTemplateComponent } from './templates/auth-template/auth-template.component';
import { DesignShowcaseComponent } from './pages/design-showcase/design-showcase.component';

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    LabelComponent,
    FormFieldComponent,
    LoginFormComponent,
    RegisterFormComponent,
    AuthTemplateComponent,
    DesignShowcaseComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    LabelComponent,
    FormFieldComponent,
    LoginFormComponent,
    RegisterFormComponent,
    AuthTemplateComponent,
    DesignShowcaseComponent,
  ],
})
export class AtomicModule {}
