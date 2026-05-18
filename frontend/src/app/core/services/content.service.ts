import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Documento,
  EventoCalendario,
  ItemGaleria,
  MensajeContacto,
  Noticia,
  SeccionInstitucional,
  SolicitudAdmision,
} from '../../shared/models';

const API = 'http://localhost:3001';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);

  getInstitucional(): Observable<{ secciones: SeccionInstitucional[] }> {
    return this.http.get<{ secciones: SeccionInstitucional[] }>(`${API}/institucional`);
  }

  getNoticias(limite = 20): Observable<{ noticias: Noticia[] }> {
    return this.http.get<{ noticias: Noticia[] }>(`${API}/noticias?limite=${limite}`);
  }

  getNoticia(id: number): Observable<{ noticia: Noticia }> {
    return this.http.get<{ noticia: Noticia }>(`${API}/noticias/${id}`);
  }

  getEventos(mes?: number, anio?: number): Observable<{ eventos: EventoCalendario[] }> {
    let url = `${API}/eventos`;
    if (mes && anio) url += `?mes=${mes}&anio=${anio}`;
    return this.http.get<{ eventos: EventoCalendario[] }>(url);
  }

  getDocumentos(): Observable<{ documentos: Documento[] }> {
    return this.http.get<{ documentos: Documento[] }>(`${API}/documentos`);
  }

  descargarDocumento(id: number): Observable<Blob> {
    return this.http.get(`${API}/documentos/${id}/descargar`, { responseType: 'blob' });
  }

  enviarContacto(body: unknown): Observable<ApiResponse & { confirmacion?: boolean }> {
    return this.http.post<ApiResponse & { confirmacion?: boolean }>(`${API}/contacto`, body);
  }

  enviarAdmision(body: unknown): Observable<ApiResponse & { admision_id?: number }> {
    return this.http.post<ApiResponse & { admision_id?: number }>(`${API}/admisiones`, body);
  }

  getGaleria(categoria?: string): Observable<{ galeria: ItemGaleria[] }> {
    let url = `${API}/galeria`;
    if (categoria) url += `?categoria=${encodeURIComponent(categoria)}`;
    return this.http.get<{ galeria: ItemGaleria[] }>(url);
  }

  getCategoriasGaleria(): Observable<{ categorias: string[] }> {
    return this.http.get<{ categorias: string[] }>(`${API}/galeria/categorias`);
  }

  /* Admin */
  crearNoticia(body: unknown): Observable<ApiResponse & { noticia_id?: number }> {
    return this.http.post(`${API}/noticias`, body);
  }

  eliminarNoticia(id: number): Observable<ApiResponse> {
    return this.http.delete(`${API}/noticias/${id}`);
  }

  crearEvento(body: unknown): Observable<ApiResponse> {
    return this.http.post(`${API}/eventos`, body);
  }

  eliminarEvento(id: number): Observable<ApiResponse> {
    return this.http.delete(`${API}/eventos/${id}`);
  }

  subirDocumento(form: FormData): Observable<ApiResponse> {
    return this.http.post(`${API}/documentos`, form);
  }

  eliminarDocumento(id: number): Observable<ApiResponse> {
    return this.http.delete(`${API}/documentos/${id}`);
  }

  getMensajes(): Observable<{ mensajes: MensajeContacto[] }> {
    return this.http.get<{ mensajes: MensajeContacto[] }>(`${API}/contacto/mensajes`);
  }

  marcarLeido(id: number): Observable<ApiResponse> {
    return this.http.patch(`${API}/contacto/${id}/leido`, {});
  }

  getAdmisiones(): Observable<{ admisiones: SolicitudAdmision[] }> {
    return this.http.get<{ admisiones: SolicitudAdmision[] }>(`${API}/admisiones`);
  }

  actualizarAdmision(id: number, estado: string): Observable<ApiResponse> {
    return this.http.patch(`${API}/admisiones/${id}`, { estado });
  }

  agregarGaleria(body: unknown): Observable<ApiResponse> {
    return this.http.post(`${API}/galeria`, body);
  }

  eliminarGaleria(id: number): Observable<ApiResponse> {
    return this.http.delete(`${API}/galeria/${id}`);
  }

  actualizarInstitucional(clave: string, body: { titulo: string; contenido: string }): Observable<ApiResponse> {
    return this.http.patch(`${API}/institucional/${clave}`, body);
  }
}
