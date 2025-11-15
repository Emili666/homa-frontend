import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AtomicModule } from '../../atomic/atomic.module';
import { LoginPageComponent } from './pages/login/login.component';
import { RegisterPageComponent } from './pages/register/register.component';
import { PasswordRecoveryPageComponent } from './pages/password-recovery/password-recovery.component';


@NgModule({
  declarations: [
    AuthComponent,
    LoginPageComponent,
    RegisterPageComponent,
    PasswordRecoveryPageComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    AtomicModule
  ]
})
export class AuthModule { }
