import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'service-schedule',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'customer',
    loadComponent: () => import('./pages/customer/customers').then(m => m.Customers),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
  },
  {
    path: 'employee',
    loadComponent: () => import('./pages/employee/employee').then(m => m.Employees),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'supplier',
    loadComponent: () => import('./pages/supplier/supplier').then(m => m.SupplierComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'service-schedule',
    loadComponent: () => import('./pages/service-schedule/service-schedule').then(m => m.ServiceScheduleComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
  },
  {
    path: 'product-schedule',
    loadComponent: () => import('./pages/product-schedule/product-schedule').then(m => m.ProductScheduleComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
  },
  {
    path: 'product',
    loadComponent: () => import('./pages/product/product').then(m => m.Products),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'service',
    loadComponent: () => import('./pages/service/service').then(m => m.Services),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: '**',
    redirectTo: 'service-schedule',
  },
];
