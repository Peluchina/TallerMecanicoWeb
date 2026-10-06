import { Routes } from '@angular/router';
import { Customers } from './pages/customer/customers';
import { SupplierComponent } from './pages/supplier/supplier';
import { ServiceScheduleComponent } from './pages/service-schedule/service-schedule';
import { ProductScheduleComponent } from './pages/product-schedule/product-schedule';
import { Products } from './pages/product/product';
import { Services } from './pages/service/service';
import { Employees } from './pages/employee/employee';
import { LoginComponent } from './pages/login/login';
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
    component: LoginComponent,
  },
  {
    path: 'customer',
    component: Customers,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
  },
  {
    path: 'employee',
    component: Employees,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'supplier',
    component: SupplierComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'service-schedule',
    component: ServiceScheduleComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
  },
  {
    path: 'product-schedule',
    component: ProductScheduleComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
  },
  {
    path: 'product',
    component: Products,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'service',
    component: Services,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: '**',
    redirectTo: 'service-schedule',
  },
];
