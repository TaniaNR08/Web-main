import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-admisiones',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="public-page">
      <div class="public-container public-container--narrow">
        <h1 class="public-page-title">Solicitud de admisión</h1>
        <p class="public-page-subtitle">Padres de familia: diligencie el formulario para inscripción en línea.</p>

        <form class="public-form card" [formGroup]="form" (ngSubmit)="enviar()">
          <h3>Datos del estudiante</h3>
          <label>Nombre completo del estudiante
            <input type="text" formControlName="nombre_estudiante" placeholder="Nombre y apellidos">
          </label>
          <label>Fecha de nacimiento
            <input type="date" formControlName="fecha_nacimiento">
          </label>
          <label>Grado solicitado
            <input type="text" formControlName="grado_solicitado" placeholder="Ej: Prejardín, 5°, 10°">
          </label>

          <h3>Datos del acudiente</h3>
          <label>Nombre del acudiente
            <input type="text" formControlName="nombre_acudiente">
          </label>
          <label>Parentesco
            <input type="text" formControlName="parentesco" placeholder="Padre, madre, tutor...">
          </label>
          <label>Correo electrónico
            <input type="email" formControlName="email">
          </label>
          <label>Teléfono
            <input type="tel" formControlName="telefono">
          </label>
          <label>Observaciones adicionales
            <textarea formControlName="mensaje" rows="4"></textarea>
          </label>

          <button type="submit" class="public-btn public-btn--primary" [disabled]="loading() || form.invalid">
            {{ loading() ? 'Enviando...' : 'Enviar solicitud' }}
          </button>
          @if (feedback()) {
            <p [class]="ok() ? 'public-feedback public-feedback--ok' : 'public-feedback public-feedback--err'">
              {{ feedback() }}
            </p>
          }
        </form>
      </div>
    </div>
  `,
})
export class AdmisionesComponent {
  private content = inject(ContentService);
  loading = signal(false);
  feedback = signal('');
  ok = signal(false);

  form = new FormGroup({
    nombre_estudiante: new FormControl('', Validators.required),
    fecha_nacimiento:  new FormControl(''),
    grado_solicitado:  new FormControl(''),
    nombre_acudiente:  new FormControl('', Validators.required),
    parentesco:        new FormControl(''),
    email:             new FormControl('', [Validators.required, Validators.email]),
    telefono:          new FormControl(''),
    mensaje:           new FormControl(''),
  });

  enviar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.feedback.set('');
    this.content.enviarAdmision(this.form.getRawValue()).subscribe({
      next: (data) => {
        this.loading.set(false);
        if (data.error) { this.feedback.set(data.error); this.ok.set(false); return; }
        this.feedback.set(data.message ?? 'Solicitud registrada');
        this.ok.set(true);
        this.form.reset();
      },
      error: () => { this.loading.set(false); this.feedback.set('Error al enviar la solicitud'); this.ok.set(false); },
    });
  }
}
