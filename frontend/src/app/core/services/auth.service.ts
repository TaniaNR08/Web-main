import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginResponse, Rol } from '../../shared/models';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  readonly user    = signal<string>(sessionStorage.getItem('user')   ?? '');
  readonly nombre  = signal<string>(sessionStorage.getItem('nombre') ?? '');
  readonly rol     = signal<Rol | null>(sessionStorage.getItem('rol') as Rol | null);
  readonly groupId     = signal<string>(sessionStorage.getItem('group_id') ?? '');
  readonly groupNombre = signal<string>(sessionStorage.getItem('group_nombre') ?? '');
  readonly tareaId     = signal<string>(sessionStorage.getItem('tarea_id') ?? '');

  login(user: string, passwd: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/login`, { user, passwd });
  }

  setSession(data: LoginResponse, user: string, passwd: string): void {
    sessionStorage.setItem('token',  data.token);
    sessionStorage.setItem('user',   user);
    sessionStorage.setItem('nombre', data.nombre ?? '');
    sessionStorage.setItem('passwd', passwd);
    sessionStorage.setItem('rol',    data.rol);
    this.user.set(user);
    this.nombre.set(data.nombre ?? '');
    this.rol.set(data.rol);
  }

  setGroupId(id: string | number): void {
    this.setGrupoContext(id, this.groupNombre());
  }

  setGrupoContext(id: string | number, nombre?: string): void {
    const v = String(id);
    sessionStorage.setItem('group_id', v);
    this.groupId.set(v);
    if (nombre) {
      sessionStorage.setItem('group_nombre', nombre);
      this.groupNombre.set(nombre);
    }
  }

  setTareaId(id: string | number): void {
    const v = String(id);
    sessionStorage.setItem('tarea_id', v);
    this.tareaId.set(v);
  }

  getToken(): string  { return sessionStorage.getItem('token')   ?? ''; }
  getPasswd(): string { return sessionStorage.getItem('passwd')  ?? ''; }

  isAuthenticated(): boolean { return !!this.getToken(); }

  logout(): void {
    sessionStorage.clear();
    this.user.set('');
    this.rol.set(null);
    this.router.navigate(['/login']);
  }

  redirectByRol(rol: Rol): void {
    const routes: Record<Rol, string> = {
      administrador: '/admin',
      profesor:      '/profesor/grupos',
      estudiante:    '/estudiante/asignaturas',
    };
    this.router.navigate([routes[rol]]);
  }
}
