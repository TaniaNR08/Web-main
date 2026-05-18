import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { parseFechaApi } from '../utils/parse-fecha';

@Pipe({ name: 'fecha', standalone: true })
export class FechaPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format = 'dd/MM/yyyy, HH:mm'): string {
    const d = parseFechaApi(value);
    if (!d) return value ? String(value) : '';
    try {
      return formatDate(d, format, 'es');
    } catch {
      return String(value);
    }
  }
}
