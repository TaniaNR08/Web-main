import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-wrapper">
        <div class="login-card">
          <header class="login-brand">
            <img src="/logo.png" alt="" class="login-brand-logo" (error)="hideLogo($event)">
            <div class="login-brand-text">
              <p class="login-brand-label">Colegio</p>
              <h1 class="login-brand-title">San Francisco de Asís</h1>
              <p class="login-brand-sub">Plataforma de gestión escolar</p>
            </div>
          </header>

          <form class="login-form" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="login-field">
              <label for="user">Usuario</label>
              <input
                id="user"
                type="text"
                formControlName="user"
                placeholder="Número de identificación"
                autocomplete="username">
            </div>

            <div class="login-field">
              <label for="passwd">Contraseña</label>
              <div class="login-pass-row">
                <input
                  id="passwd"
                  [type]="showPass() ? 'text' : 'password'"
                  formControlName="passwd"
                  placeholder="Contraseña"
                  autocomplete="current-password">
                <button type="button" class="login-pass-toggle" (click)="showPass.set(!showPass())">
                  {{ showPass() ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
            </div>

            @if (error()) {
              <p class="login-error" role="alert">{{ error() }}</p>
            }

            <button type="submit" class="btn-primary login-submit" [disabled]="loading()">
              @if (loading()) { Verificando… } @else { Ingresar }
            </button>
          </form>

          <p class="login-footer">
            <a routerLink="/">Volver al sitio público</a>
          </p>
        </div>
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

  hideLogo(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { user, passwd } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');

    this.auth.login(user!, passwd!).subscribe({
      next: (data) => {
        if (data.error) {
          this.error.set(data.error);
          this.loading.set(false);
          return;
        }
        this.auth.setSession(data, user!, passwd!);
        this.auth.redirectByRol(data.rol);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.loading.set(false);
      },
    });
  }
}
