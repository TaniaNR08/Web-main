import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../../shared/models';

export function rolGuard(required: Rol): CanActivateFn {
  return () => {
    if (sessionStorage.getItem('rol') === required) return true;
    inject(Router).navigate(['/']);
    return false;
  };
}
