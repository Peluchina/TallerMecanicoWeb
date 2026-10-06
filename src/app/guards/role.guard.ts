import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as string[]) || [];

  if (allowedRoles.length === 0 || authService.hasRole(allowedRoles)) {
    return true;
  }

  Swal.fire({
    icon: 'warning',
    title: 'Acceso Restringido',
    text: `Tu rol (${authService.getUserRole()}) no tiene permisos para acceder a esta sección.`,
    timer: 2200,
    showConfirmButton: false,
  });

  return router.createUrlTree(['/service-schedule']);
};
