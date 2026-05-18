import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import {
  Documento, EventoCalendario, ItemGaleria, MensajeContacto, Noticia, SolicitudAdmision,
} from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

type Tab = 'noticias' | 'eventos' | 'documentos' | 'mensajes' | 'admisiones' | 'galeria';

@Component({
  selector: 'app-admin-contenido',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, FormsModule, RouterLink, DatePipe],
  template: `
    <app-header [showBack]="false" />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-6xl mx-auto space-y-4">
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h1 class="text-xl font-bold text-white">Gestión de contenido</h1>
            <a routerLink="/admin" class="text-sm text-white/80 hover:text-white underline">Volver a usuarios</a>
          </div>

          <div class="flex flex-wrap gap-2">
            @for (t of tabs; track t.id) {
              <button type="button" class="admin-tab" [class.admin-tab--active]="tab() === t.id" (click)="tab.set(t.id)">
                {{ t.label }}
              </button>
            }
          </div>

          @if (tab() === 'noticias') {
            <div class="card p-6 space-y-4">
              <h2 class="font-semibold">Nueva noticia</h2>
              <form [formGroup]="noticiaForm" (ngSubmit)="crearNoticia()" class="grid sm:grid-cols-2 gap-3">
                <input formControlName="titulo" placeholder="Titulo" class="border rounded-lg px-3 py-2 text-sm">
                <select formControlName="tipo" class="border rounded-lg px-3 py-2 text-sm">
                  <option value="noticia">Noticia</option>
                  <option value="evento">Evento</option>
                </select>
                <input formControlName="imagen_url" placeholder="URL imagen (opcional)" class="border rounded-lg px-3 py-2 text-sm sm:col-span-2">
                <textarea formControlName="contenido" placeholder="Contenido" rows="3" class="border rounded-lg px-3 py-2 text-sm sm:col-span-2"></textarea>
                <button type="submit" class="btn-primary sm:col-span-2">Publicar</button>
              </form>
              <ul class="divide-y text-sm">
                @for (n of noticias(); track n.noticia_id) {
                  <li class="py-2 flex justify-between gap-2">
                    <span>{{ n.titulo }} <span class="text-gray-400">({{ n.tipo }})</span></span>
                    <button type="button" class="text-red-600 text-xs" (click)="eliminarNoticia(n.noticia_id)">Eliminar</button>
                  </li>
                }
              </ul>
            </div>
          }

          @if (tab() === 'eventos') {
            <div class="card p-6 space-y-4">
              <h2 class="font-semibold">Nuevo evento (calendario)</h2>
              <form [formGroup]="eventoForm" (ngSubmit)="crearEvento()" class="grid sm:grid-cols-2 gap-3">
                <input formControlName="titulo" placeholder="Titulo" class="border rounded-lg px-3 py-2 text-sm">
                <input type="date" formControlName="fecha" class="border rounded-lg px-3 py-2 text-sm">
                <input formControlName="tipo" placeholder="Tipo" class="border rounded-lg px-3 py-2 text-sm">
                <input formControlName="color" type="color" class="border rounded-lg h-10">
                <textarea formControlName="descripcion" placeholder="Descripción" rows="2" class="border rounded-lg px-3 py-2 text-sm sm:col-span-2"></textarea>
                <button type="submit" class="btn-primary sm:col-span-2">Agregar</button>
              </form>
              <ul class="divide-y text-sm">
                @for (e of eventos(); track e.evento_id) {
                  <li class="py-2 flex justify-between">
                    <span>{{ e.titulo }} — {{ e.fecha | date:'mediumDate' }}</span>
                    <button type="button" class="text-red-600 text-xs" (click)="eliminarEvento(e.evento_id)">Eliminar</button>
                  </li>
                }
              </ul>
            </div>
          }

          @if (tab() === 'documentos') {
            <div class="card p-6 space-y-4">
              <h2 class="font-semibold">Subir documento</h2>
              <form (ngSubmit)="subirDoc()" class="grid sm:grid-cols-2 gap-3">
                <input type="text" [(ngModel)]="docNombre" name="docNombre" placeholder="Nombre" class="border rounded-lg px-3 py-2 text-sm" required>
                <select [(ngModel)]="docCategoria" name="docCat" class="border rounded-lg px-3 py-2 text-sm">
                  <option value="circular">Circular</option>
                  <option value="formato">Formato</option>
                  <option value="pei">PEI</option>
                  <option value="manual">Manual</option>
                  <option value="lista">Lista</option>
                  <option value="otro">Otro</option>
                </select>
                <input type="file" (change)="onFile($event)" accept=".pdf,.doc,.docx" class="sm:col-span-2 text-sm">
                <button type="submit" class="btn-primary sm:col-span-2">Subir</button>
              </form>
              <ul class="divide-y text-sm">
                @for (d of documentos(); track d.doc_id) {
                  <li class="py-2 flex justify-between">
                    <span>{{ d.nombre }} ({{ d.categoria }})</span>
                    <button type="button" class="text-red-600 text-xs" (click)="eliminarDoc(d.doc_id)">Eliminar</button>
                  </li>
                }
              </ul>
            </div>
          }

          @if (tab() === 'mensajes') {
            <div class="card p-6 overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="bg-gray-100"><th class="p-2 text-left">Fecha</th><th class="p-2 text-left">Nombre</th><th class="p-2 text-left">Email</th><th class="p-2 text-left">Mensaje</th><th></th></tr></thead>
                <tbody>
                  @for (m of mensajes(); track m.mensaje_id) {
                    <tr [class]="m.leido ? '' : 'bg-blue-50'">
                      <td class="p-2">{{ m.fecha | date:'short' }}</td>
                      <td class="p-2">{{ m.nombre }}</td>
                      <td class="p-2">{{ m.email }}</td>
                      <td class="p-2 max-w-xs truncate">{{ m.mensaje }}</td>
                      <td class="p-2">
                        @if (!m.leido) {
                          <button type="button" class="text-xs text-blue-600" (click)="marcarLeido(m.mensaje_id)">Marcar leido</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (tab() === 'admisiones') {
            <div class="card p-6 overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="bg-gray-100"><th class="p-2">Estudiante</th><th class="p-2">Acudiente</th><th class="p-2">Email</th><th class="p-2">Estado</th></tr></thead>
                <tbody>
                  @for (a of admisiones(); track a.admision_id) {
                    <tr>
                      <td class="p-2">{{ a.nombre_estudiante }}</td>
                      <td class="p-2">{{ a.nombre_acudiente }}</td>
                      <td class="p-2">{{ a.email }}</td>
                      <td class="p-2">
                        <select class="border rounded text-xs" [value]="a.estado" (change)="cambiarEstado(a.admision_id, $event)">
                          <option value="pendiente">Pendiente</option>
                          <option value="revisada">Revisada</option>
                          <option value="aceptada">Aceptada</option>
                          <option value="rechazada">Rechazada</option>
                        </select>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (tab() === 'galeria') {
            <div class="card p-6 space-y-4">
              <form [formGroup]="galeriaForm" (ngSubmit)="agregarGaleria()" class="grid sm:grid-cols-2 gap-3">
                <input formControlName="titulo" placeholder="Titulo" class="border rounded-lg px-3 py-2 text-sm">
                <input formControlName="url" placeholder="URL imagen o video" class="border rounded-lg px-3 py-2 text-sm">
                <select formControlName="tipo" class="border rounded-lg px-3 py-2 text-sm">
                  <option value="imagen">Imagen</option>
                  <option value="video">Video</option>
                </select>
                <input formControlName="categoria" placeholder="Categoria" class="border rounded-lg px-3 py-2 text-sm">
                <button type="submit" class="btn-primary sm:col-span-2">Agregar</button>
              </form>
              <ul class="divide-y text-sm">
                @for (g of galeria(); track g.media_id) {
                  <li class="py-2 flex justify-between">
                    <span>{{ g.titulo }} ({{ g.categoria }})</span>
                    <button type="button" class="text-red-600 text-xs" (click)="eliminarGaleria(g.media_id)">Eliminar</button>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminContenidoComponent implements OnInit {
  private content = inject(ContentService);

  tabs: { id: Tab; label: string }[] = [
    { id: 'noticias', label: 'Noticias' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'mensajes', label: 'Contacto' },
    { id: 'admisiones', label: 'Admisiones' },
    { id: 'galeria', label: 'Galería' },
  ];

  tab = signal<Tab>('noticias');
  noticias = signal<Noticia[]>([]);
  eventos = signal<EventoCalendario[]>([]);
  documentos = signal<Documento[]>([]);
  mensajes = signal<MensajeContacto[]>([]);
  admisiones = signal<SolicitudAdmision[]>([]);
  galeria = signal<ItemGaleria[]>([]);

  docNombre = '';
  docCategoria = 'circular';
  docFile: File | null = null;

  noticiaForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    contenido: new FormControl('', Validators.required),
    imagen_url: new FormControl(''),
    tipo: new FormControl('noticia'),
  });

  eventoForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    descripcion: new FormControl(''),
    fecha: new FormControl('', Validators.required),
    tipo: new FormControl('general'),
    color: new FormControl('#2563eb'),
  });

  galeriaForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required),
    tipo: new FormControl('imagen'),
    categoria: new FormControl('general'),
  });

  ngOnInit(): void { this.cargarTodo(); }

  cargarTodo(): void {
    this.content.getNoticias(100).subscribe({ next: ({ noticias }) => this.noticias.set(noticias) });
    this.content.getEventos().subscribe({ next: ({ eventos }) => this.eventos.set(eventos) });
    this.content.getDocumentos().subscribe({ next: ({ documentos }) => this.documentos.set(documentos) });
    this.content.getMensajes().subscribe({ next: ({ mensajes }) => this.mensajes.set(mensajes) });
    this.content.getAdmisiones().subscribe({ next: ({ admisiones }) => this.admisiones.set(admisiones) });
    this.content.getGaleria().subscribe({ next: ({ galeria }) => this.galeria.set(galeria) });
  }

  crearNoticia(): void {
    if (this.noticiaForm.invalid) return;
    this.content.crearNoticia(this.noticiaForm.getRawValue()).subscribe({
      next: () => { sw.success('Publicada'); this.noticiaForm.reset({ tipo: 'noticia' }); this.cargarTodo(); },
      error: () => sw.error('Error', 'No se pudo crear'),
    });
  }

  eliminarNoticia(id: number): void {
    this.content.eliminarNoticia(id).subscribe({ next: () => this.cargarTodo() });
  }

  crearEvento(): void {
    if (this.eventoForm.invalid) return;
    this.content.crearEvento(this.eventoForm.getRawValue()).subscribe({
      next: () => { sw.success('Evento creado'); this.eventoForm.reset({ color: '#2563eb', tipo: 'general' }); this.cargarTodo(); },
    });
  }

  eliminarEvento(id: number): void {
    this.content.eliminarEvento(id).subscribe({ next: () => this.cargarTodo() });
  }

  onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.docFile = input.files?.[0] ?? null;
  }

  subirDoc(): void {
    if (!this.docFile || !this.docNombre) return;
    const form = new FormData();
    form.append('nombre', this.docNombre);
    form.append('categoria', this.docCategoria);
    form.append('archivo', this.docFile);
    this.content.subirDocumento(form).subscribe({
      next: () => { sw.success('Documento subido'); this.docNombre = ''; this.docFile = null; this.cargarTodo(); },
      error: () => sw.error('Error', 'No se pudo subir'),
    });
  }

  eliminarDoc(id: number): void {
    this.content.eliminarDocumento(id).subscribe({ next: () => this.cargarTodo() });
  }

  marcarLeido(id: number): void {
    this.content.marcarLeido(id).subscribe({ next: () => this.cargarTodo() });
  }

  cambiarEstado(id: number, ev: Event): void {
    const estado = (ev.target as HTMLSelectElement).value;
    this.content.actualizarAdmision(id, estado).subscribe({ next: () => this.cargarTodo() });
  }

  agregarGaleria(): void {
    if (this.galeriaForm.invalid) return;
    this.content.agregarGaleria(this.galeriaForm.getRawValue()).subscribe({
      next: () => { sw.success('Agregado'); this.galeriaForm.reset({ tipo: 'imagen', categoria: 'general' }); this.cargarTodo(); },
    });
  }

  eliminarGaleria(id: number): void {
    this.content.eliminarGaleria(id).subscribe({ next: () => this.cargarTodo() });
  }
}
