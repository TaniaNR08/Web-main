import Swal from 'sweetalert2';
export { Swal };

const POPUP = 'rounded-2xl';

export async function showSuccess(title: string, text?: string): Promise<void> {
  await Swal.fire({ icon: 'success', title, text, timer: 1500, showConfirmButton: false, customClass: { popup: POPUP } });
}

export async function showError(title: string, text?: string): Promise<void> {
  await Swal.fire({ icon: 'error', title, text, customClass: { popup: POPUP } });
}

export async function showInfo(title: string, text?: string): Promise<void> {
  await Swal.fire({ icon: 'info', title, text, customClass: { popup: POPUP } });
}

export async function showWarning(title: string, text?: string): Promise<void> {
  await Swal.fire({ icon: 'warning', title, text, timer: 4000, showConfirmButton: false, customClass: { popup: POPUP } });
}

export async function confirmDelete(text: string): Promise<boolean> {
  const r = await Swal.fire({
    title: 'Confirmar eliminacion',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: POPUP },
  });
  return r.isConfirmed;
}
