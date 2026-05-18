import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { startWith } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Grupo } from '../../../shared/models';
import { coincideBusqueda } from '../../../shared/utils/texto-busqueda';
import { sw } from '../../../shared/utils/swal';

interface GruposResponse { grupos: Grupo[]; }

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header [showBack]="false" />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="grupos-page max-w-5xl mx-auto">

          <header class="grupos-hero card">
            <div class="grupos-hero-text">
              <p class="grupos-hero-label">Panel del profesor</p>
              <h1 class="grupos-hero-title">Mis grupos</h1>
              @if (auth.nombre()) {
                <p class="grupos-hero-greeting">Hola, {{ auth.nombre() }}</p>
              }
              <p class="grupos-hero-stats">
                <span>{{ totalGrupos() }} {{ totalGrupos() === 1 ? 'grupo' : 'grupos' }}</span>
                <span class="grupos-hero-dot" aria-hidden="true">·</span>
                <span>{{ totalEstudiantes() }} estudiantes inscritos</span>
              </p>
            </div>
            <button type="button" class="grupos-btn-primary" (click)="router.navigate(['/profesor/grupos/crear'])">
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
              Crear grupo
            </button>
          </header>

          @if (grupos().length > 0) {
            <label class="grupos-search" for="buscar-grupo">
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              <input
                id="buscar-grupo"
                type="search"
                [formControl]="busqueda"
                placeholder="Buscar por nombre del grupo..."
                autocomplete="off">
            </label>
          }

          @if (cargando()) {
            <p class="grupos-state">Cargando grupos...</p>
          } @else if (!grupos().length) {
            <div class="grupos-empty card">
              <i class="fa-solid fa-folder-open grupos-empty-icon" aria-hidden="true"></i>
              <h2 class="grupos-empty-title">Aún no tienes grupos</h2>
              <p class="grupos-empty-text">Crea tu primer grupo para asignar tareas e inscribir estudiantes.</p>
              <button type="button" class="grupos-btn-primary" (click)="router.navigate(['/profesor/grupos/crear'])">
                Crear primer grupo
              </button>
            </div>
          } @else if (!gruposFiltrados().length) {
            <p class="grupos-state">No hay grupos que coincidan con «{{ terminoBusqueda() }}».</p>
          } @else {
            <ul class="grupos-grid" role="list">
              @for (g of gruposFiltrados(); track g.group_id) {
                <li>
                  <button type="button" class="grupo-card" (click)="verGrupo(g)">
                    <span class="grupo-card-icon" aria-hidden="true">
                      <i class="fa-solid fa-people-group"></i>
                    </span>
                    <span class="grupo-card-body">
                      <span class="grupo-card-name">{{ g.nombre }}</span>
                      <span class="grupo-card-meta">
                        {{ etiquetaEstudiantes(g.total_estudiantes ?? 0) }}
                      </span>
                    </span>
                    <span class="grupo-card-action">
                      Gestionar
                      <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </span>
                  </button>
                </li>
              }
            </ul>
          }

        </div>
      </div>
    </div>
  `,
})
export class GruposComponent implements OnInit {
  private api  = inject(ApiService);
  auth         = inject(AuthService);
  router       = inject(Router);

  grupos   = signal<Grupo[]>([]);
  cargando = signal(true);
  busqueda = new FormControl('', { nonNullable: true });

  /** Reactivo: FormControl no dispara computed por sí solo */
  terminoBusqueda = toSignal(
    this.busqueda.valueChanges.pipe(startWith(this.busqueda.value)),
    { initialValue: '' },
  );

  gruposFiltrados = computed(() => {
    const q = this.terminoBusqueda();
    const lista = this.grupos();
    if (!q?.trim()) return lista;
    return lista.filter((g) => coincideBusqueda(g.nombre, q));
  });

  totalGrupos = computed(() => this.grupos().length);

  totalEstudiantes = computed(() =>
    this.grupos().reduce((sum, g) => sum + (g.total_estudiantes ?? 0), 0)
  );

  ngOnInit(): void {
    const user = this.auth.user();
    this.api.get<GruposResponse>(`/grupos/profesor/${user}`).subscribe({
      next: ({ grupos }) => {
        this.grupos.set(grupos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        sw.error('Error', 'No se pudo cargar los grupos.');
      },
    });
  }

  etiquetaEstudiantes(n: number): string {
    if (n === 0) return 'Sin estudiantes inscritos';
    return n === 1 ? '1 estudiante inscrito' : `${n} estudiantes inscritos`;
  }

  verGrupo(g: Grupo): void {
    this.auth.setGrupoContext(g.group_id, g.nombre);
    this.router.navigate(['/profesor/grupos', g.group_id]);
  }
}
