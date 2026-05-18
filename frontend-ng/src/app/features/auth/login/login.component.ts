import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-bg"></div>
    <div class="login-wrapper">
      <div class="login-card">

        <div class="login-header">
          <div class="login-logo">
            <img src="/logo.png" alt="Logo San Francisco de Asis"
                 (error)="$any($event.target).style.display='none'">
          </div>
          <h1>San Francisco de Asis</h1>
          <p>Plataforma de Gestion Escolar</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field-group">
            <label for="user">Usuario</label>
            <div class="field-wrapper">
              <i class="fa-solid fa-user field-icon"></i>
              <input id="user" type="text" formControlName="user"
                     placeholder="Ingresa tu usuario">
            </div>
          </div>

          <div class="field-group">
            <label for="passwd">Contrasena</label>
            <div class="field-wrapper">
              <i class="fa-solid fa-lock field-icon"></i>
              <input id="passwd" [type]="showPass() ? 'text' : 'password'"
                     formControlName="passwd" placeholder="Ingresa tu contrasena">
              <button type="button" class="toggle-password" (click)="showPass.set(!showPass())">
                <i [class]="showPass() ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="login-btn" [disabled]="loading()">
            @if (loading()) { Verificando... }
            @else { Ingresar <i class="fa-solid fa-arrow-right-to-bracket"></i> }
          </button>
        </form>

        @if (error()) {
          <p class="feedback-text">{{ error() }}</p>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  form = new FormGroup({
    user:   new FormControl('', Validators.required),
    passwd: new FormControl('', Validators.required),
  });

  showPass = signal(false);
  loading  = signal(false);
  error    = signal('');

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const { user, passwd } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');

    this.auth.login(user!, passwd!).subscribe({
      next: (data) => {
        if (data.error) { this.error.set(data.error); this.loading.set(false); return; }
        this.auth.setSession(data, user!, passwd!);
        this.auth.redirectByRol(data.rol);
      },
      error: () => { this.error.set('Error del servidor.'); this.loading.set(false); },
    });
  }
}
