import Swal from 'sweetalert2';
export { Swal };

const P = 'rounded-2xl';
const CONFIRM = '#1e3a5f';

export const sw = {
  success: (title: string, text?: string) =>
    Swal.fire({ icon: 'success', title, text, timer: 1500, showConfirmButton: false, customClass: { popup: P } }),

  error: (title: string, text?: string) =>
    Swal.fire({ icon: 'error', title, text, confirmButtonColor: CONFIRM, customClass: { popup: P } }),

  warning: (title: string, text?: string) =>
    Swal.fire({ icon: 'warning', title, text, timer: 4000, showConfirmButton: false, customClass: { popup: P } }),

  info: (title: string, text?: string) =>
    Swal.fire({ icon: 'info', title, text, confirmButtonColor: CONFIRM, customClass: { popup: P } }),

  confirm: (text: string) =>
    Swal.fire({
      title: 'Confirmar eliminación', text, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Si, eliminar', cancelButtonText: 'Cancelar',
      customClass: { popup: P },
    }).then(r => r.isConfirmed),
};
