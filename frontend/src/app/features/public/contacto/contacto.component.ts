import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="public-page">
      <div class="public-container public-container--narrow">
        <h1 class="public-page-title">Contacto institucional</h1>
        <p class="public-page-subtitle">Envíenos sus consultas o comentarios. Recibirá confirmación de recepción.</p>

        <form class="public-form card" [formGroup]="form" (ngSubmit)="enviar()">
          <label>Nombre
            <input type="text" formControlName="nombre">
          </label>
          <label>Correo electrónico
            <input type="email" formControlName="email">
          </label>
          <label>Asunto
            <input type="text" formControlName="asunto">
          </label>
          <label>Mensaje
            <textarea formControlName="mensaje" rows="5"></textarea>
          </label>
          <button type="submit" class="public-btn public-btn--primary" [disabled]="loading() || form.invalid">
            {{ loading() ? 'Enviando...' : 'Enviar mensaje' }}
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
export class ContactoComponent {
  private content = inject(ContentService);
  loading = signal(false);
  feedback = signal('');
  ok = signal(false);

  form = new FormGroup({
    nombre:  new FormControl('', Validators.required),
    email:   new FormControl('', [Validators.required, Validators.email]),
    asunto:  new FormControl(''),
    mensaje: new FormControl('', Validators.required),
  });

  enviar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.content.enviarContacto(this.form.getRawValue()).subscribe({
      next: (data) => {
        this.loading.set(false);
        if (data.error) { this.feedback.set(data.error); this.ok.set(false); return; }
        this.feedback.set(data.message ?? 'Mensaje enviado');
        this.ok.set(true);
        this.form.reset();
      },
      error: () => { this.loading.set(false); this.feedback.set('Error al enviar'); this.ok.set(false); },
    });
  }
}
