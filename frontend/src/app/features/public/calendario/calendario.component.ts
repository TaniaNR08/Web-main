import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { EventoCalendario } from '../../../shared/models';

interface GrupoMes {
  clave: string;
  etiqueta: string;
  eventos: EventoCalendario[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="public-page">
      <div class="public-container">
        <h1 class="public-page-title">Calendario académico</h1>
        <p class="public-page-subtitle">Fechas importantes del año escolar: exámenes, celebraciones y actividades.</p>

        <div class="public-cal-controls">
          <button type="button"
            class="public-btn"
            [class.public-btn--primary]="vista() === 'anio'"
            [class.public-btn--secondary]="vista() !== 'anio'"
            (click)="verAnioCompleto()">
            Año completo
          </button>
          <button type="button" class="public-btn public-btn--secondary" (click)="cambiarMes(-1)">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="public-cal-label">{{ mesNombre() }} {{ anio() }}</span>
          <button type="button" class="public-btn public-btn--secondary" (click)="cambiarMes(1)">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        @if (vista() === 'anio') {
          @for (grupo of gruposPorMes(); track grupo.clave) {
            <section class="public-cal-month-block">
              <h2 class="public-cal-month-title">{{ grupo.etiqueta }}</h2>
              <ul class="public-cal-list">
                @for (e of grupo.eventos; track e.evento_id) {
                  <li class="public-cal-item" [style.borderLeftColor]="e.color">
                    <div class="public-cal-date">{{ e.fecha | date:'d MMM':'':'es' }}</div>
                    <div>
                      <strong>{{ e.titulo }}</strong>
                      @if (e.descripcion) { <p class="public-muted">{{ e.descripcion }}</p> }
                      <span class="public-badge public-badge--sm">{{ e.tipo }}</span>
                    </div>
                  </li>
                }
              </ul>
            </section>
          } @empty {
            <p class="public-muted">No hay eventos programados.</p>
          }
        } @else {
          <ul class="public-cal-list">
            @for (e of eventosMes(); track e.evento_id) {
              <li class="public-cal-item" [style.borderLeftColor]="e.color">
                <div class="public-cal-date">{{ e.fecha | date:'d MMM':'':'es' }}</div>
                <div>
                  <strong>{{ e.titulo }}</strong>
                  @if (e.descripcion) { <p class="public-muted">{{ e.descripcion }}</p> }
                  <span class="public-badge public-badge--sm">{{ e.tipo }}</span>
                </div>
              </li>
            } @empty {
              <li class="public-muted">No hay eventos en {{ mesNombre() }} {{ anio() }}.</li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class CalendarioComponent implements OnInit {
  private content = inject(ContentService);
  private todos = signal<EventoCalendario[]>([]);

  vista = signal<'anio' | 'mes'>('anio');
  mes = signal(new Date().getMonth() + 1);
  anio = signal(new Date().getFullYear());

  private meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  eventosMes = computed(() =>
    this.todos().filter((e) => {
      const d = new Date(e.fecha);
      return d.getMonth() + 1 === this.mes() && d.getFullYear() === this.anio();
    })
  );

  gruposPorMes = computed((): GrupoMes[] => {
    const map = new Map<string, GrupoMes>();
    for (const e of this.todos()) {
      const d = new Date(e.fecha);
      const mes = d.getMonth() + 1;
      const anio = d.getFullYear();
      const clave = `${anio}-${mes}`;
      if (!map.has(clave)) {
        map.set(clave, {
          clave,
          etiqueta: `${this.meses[mes - 1]} ${anio}`,
          eventos: [],
        });
      }
      map.get(clave)!.eventos.push(e);
    }
    return [...map.values()].sort((a, b) => a.clave.localeCompare(b.clave));
  });

  ngOnInit(): void {
    this.content.getEventos().subscribe({
      next: ({ eventos }) => this.todos.set(eventos),
    });
  }

  mesNombre(): string {
    return this.meses[this.mes() - 1];
  }

  verAnioCompleto(): void {
    this.vista.set('anio');
  }

  cambiarMes(delta: number): void {
    let m = this.mes() + delta;
    let a = this.anio();
    if (m < 1) { m = 12; a--; }
    if (m > 12) { m = 1; a++; }
    this.mes.set(m);
    this.anio.set(a);
    this.vista.set('mes');
  }
}
