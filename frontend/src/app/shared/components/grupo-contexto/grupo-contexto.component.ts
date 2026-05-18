import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Grupo } from '../../models';

interface GrupoResponse {
  grupo: Grupo;
  error?: string;
}

@Component({
  selector: 'app-grupo-contexto',
  standalone: true,
  template: `
    @if (nombre()) {
      <div class="grupo-contexto" [class.grupo-contexto--compact]="compact()">
        <p class="grupo-contexto-label">Grupo actual</p>
        <h1 class="grupo-contexto-title">{{ nombre() }}</h1>
        @if (subtitulo()) {
          <p class="grupo-contexto-sub">{{ subtitulo() }}</p>
        }
      </div>
    }
  `,
})
export class GrupoContextoComponent implements OnInit {
  private api   = inject(ApiService);
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);

  /** Texto opcional debajo del nombre (ej. "Inscribir estudiante") */
  subtitulo = input<string>();
  compact   = input(false);

  nombre = signal('');

  ngOnInit(): void {
    const cached = sessionStorage.getItem('group_nombre');
    const groupId = this.resolveGroupId();
    if (!groupId) return;

    if (cached && sessionStorage.getItem('group_id') === groupId) {
      this.nombre.set(cached);
    }

    this.api.get<GrupoResponse>(`/grupos/${groupId}`).subscribe({
      next: ({ grupo }) => {
        if (grupo?.nombre) {
          this.nombre.set(grupo.nombre);
          this.auth.setGrupoContext(groupId, grupo.nombre);
        }
      },
    });
  }

  private resolveGroupId(): string | null {
    let r: ActivatedRoute | null = this.route;
    while (r) {
      const id = r.snapshot.paramMap.get('id');
      if (id) return id;
      r = r.parent;
    }
    return null;
  }
}
