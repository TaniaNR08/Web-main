export const session = {
  getToken:   () => sessionStorage.getItem('token')   ?? '',
  getUser:    () => sessionStorage.getItem('user')    ?? '',
  getPasswd:  () => sessionStorage.getItem('passwd')  ?? '',
  getRol:     () => sessionStorage.getItem('rol')     ?? '',
  getGroupId: () => sessionStorage.getItem('group_id') ?? '',
  getTareaId: () => sessionStorage.getItem('tarea_id') ?? '',
  set: (key: string, value: string) => sessionStorage.setItem(key, value),
  clear: () => sessionStorage.clear(),
};

export function logout(): void {
  session.clear();
  window.location.href = '/';
}
