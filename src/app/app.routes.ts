import { Routes } from '@angular/router';
import { Customers } from './pages/customer/customers';
import { SupplierComponent } from './pages/supplier/supplier';
import { ServiceScheduleComponent } from './pages/service-schedule/service-schedule';
import { ProductScheduleComponent } from './pages/product-schedule/product-schedule';
import { HomeComponent } from './pages/home/home';
import { Products } from './pages/product/product';
import { Services } from './pages/service/service';
import { Employees } from './pages/employee/employee';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'HomeComponent',
  },
  {
    path: 'customer',
    component: Customers,
  },
  {
    path: 'employee',
    component: Employees,
  },
  {
    path: 'supplier',
    component: SupplierComponent,
  },
  {
    path: 'service-schedule',
    component: ServiceScheduleComponent,
  },
  {
    path: 'product-schedule',
    component: ProductScheduleComponent,
  },
  {
    path: 'product',
    component: Products,
  },
  {
    path: 'service',
    component: Services,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
