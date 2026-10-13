import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ProductSchedule } from '../../models/productSchedule.model';
import { Product } from '../../models/product.model';
import { ServiceSchedule } from '../../models/serviceSchedule.model';
import { Customer } from '../../models/customer.model';
import { Service } from '../../models/service.model';

import { ProductScheduleService } from '../../services/productSchedule.service';
import { ProductService } from '../../services/product.service';
import { ServicesSchedule } from '../../services/serviceSchedule.service';
import { CustomerService } from '../../services/customer.service';
import { ServiceService } from '../../services/service.service';

@Component({
  selector: 'app-product-schedule',
  imports: [FormsModule],
  templateUrl: './product-schedule.html',
  styleUrl: './product-schedule.css',
})
export class ProductScheduleComponent implements OnInit {
  productSchedules: ProductSchedule[] = [];
  products: Product[] = [];
  serviceSchedules: ServiceSchedule[] = [];
  customers: Customer[] = [];
  services: Service[] = [];

  selectedServiceScheduleId: number | null = null;

  productSearch = '';
  showProductSuggestions = false;
  formError = '';

  newProductSchedule = {
    productId: null as number | null,
    serviceScheduleId: null as number | null,
    quantity: null as number | null,
    productUseDate: this.getDefaultDate(),
  };

  constructor(
    private productScheduleService: ProductScheduleService,
    private productService: ProductService,
    private serviceScheduleService: ServicesSchedule,
    private customerService: CustomerService,
    private serviceService: ServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadServiceSchedules();
    this.loadProductSchedules();
    this.loadCustomers();
    this.loadServices();

    this.route.queryParams.subscribe((params) => {
      if (params['serviceScheduleId']) {
        const id = Number(params['serviceScheduleId']);
        this.selectedServiceScheduleId = id;
        this.newProductSchedule.serviceScheduleId = id;
      }
    });
  }

  private getDefaultDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Error al obtener productos:', err),
    });
  }

  loadServiceSchedules(): void {
    this.serviceScheduleService.getAll().subscribe({
      next: (data) => (this.serviceSchedules = data),
      error: (err) => console.error('Error al obtener programaciones de servicio:', err),
    });
  }

  loadProductSchedules(): void {
    this.productScheduleService.getAll().subscribe({
      next: (data) => {
        this.productSchedules = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al obtener productos de programación:', err),
    });
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => (this.customers = data),
      error: (err) => console.error('Error al obtener clientes:', err),
    });
  }

  loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (data) => (this.services = data),
      error: (err) => console.error('Error al obtener servicios:', err),
    });
  }

  get availableServiceSchedules(): ServiceSchedule[] {
    return this.serviceSchedules.filter((s) => s.serviceScheduleStatus !== 1);
  }

  get filteredProducts(): Product[] {
    const activeProducts = this.products.filter(
      (p) => (p.productStatus === 0 || p.productStatus === undefined || p.productStatus === null) && p.stock > 0
    );
    const query = this.productSearch.trim().toLowerCase();
    if (!query) return activeProducts;
    return activeProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(query) ||
        p.productId.toString().includes(query),
    );
  }

  get selectedServiceScheduleLabel(): string {
    const id = this.newProductSchedule.serviceScheduleId || this.selectedServiceScheduleId;
    if (!id) return '';
    const sched = this.serviceSchedules.find((s) => s.serviceScheduleId === id);
    if (!sched) return `Programación #${id}`;
    const cust = this.customers.find((c) => c.customerId === sched.customerId);
    const serv = this.services.find((s) => s.serviceId === sched.serviceId);
    const custName = cust ? `${cust.firstName} ${cust.lastName}` : `Cliente #${sched.customerId}`;
    const servName = serv ? serv.serviceName : `Servicio #${sched.serviceId}`;
    return `Programación #${id} — ${custName} (${servName})`;
  }

  onProductSearchChanged(): void {
    this.showProductSuggestions = this.productSearch.trim().length > 0;
    const selected = this.products.find((p) => p.productId === this.newProductSchedule.productId);
    const label = selected ? `${selected.productName} — S/ ${selected.price} (Stock disp: ${selected.stock})` : '';
    if (this.productSearch !== label) {
      this.newProductSchedule.productId = null;
    }
  }

  selectProduct(product: Product): void {
    this.newProductSchedule.productId = product.productId;
    this.productSearch = `${product.productName} — S/ ${product.price} (Stock disp: ${product.stock})`;
    this.showProductSuggestions = false;
    this.formError = '';
  }

  getProductName(productId: number): string {
    const p = this.products.find((item) => item.productId === productId);
    return p ? p.productName : `ID: ${productId}`;
  }

  getServiceScheduleInfo(serviceScheduleId: number): string {
    const sched = this.serviceSchedules.find((s) => s.serviceScheduleId === serviceScheduleId);
    if (!sched) return `ID: ${serviceScheduleId}`;
    const cust = this.customers.find((c) => c.customerId === sched.customerId);
    const serv = this.services.find((s) => s.serviceId === sched.serviceId);
    const custName = cust ? `${cust.firstName} ${cust.lastName}` : `Cliente #${sched.customerId}`;
    const servName = serv ? serv.serviceName : `Servicio #${sched.serviceId}`;
    return `#${serviceScheduleId} - ${custName} (${servName})`;
  }

  get filteredProductSchedules(): ProductSchedule[] {
    if (this.selectedServiceScheduleId) {
      return this.productSchedules.filter(
        (ps) => ps.serviceScheduleId === this.selectedServiceScheduleId,
      );
    }
    return this.productSchedules;
  }

  createProductSchedule(): void {
    if (
      !this.newProductSchedule.serviceScheduleId ||
      !this.newProductSchedule.productId ||
      !this.newProductSchedule.quantity ||
      this.newProductSchedule.quantity <= 0
    ) {
      this.formError = 'Por favor selecciona una programación, un producto y una cantidad válida.';
      return;
    }

    const selectedProd = this.products.find((p) => p.productId === this.newProductSchedule.productId);
    if (selectedProd && this.newProductSchedule.quantity > selectedProd.stock) {
      this.formError = `La cantidad solicitada (${this.newProductSchedule.quantity}) supera el stock disponible (${selectedProd.stock}).`;
      return;
    }

    this.formError = '';

    Swal.fire({
      title: '¿Asignar producto a la programación?',
      text: 'Se registrará el producto para esta programación.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Asignando...',
        text: 'Por favor espera.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const rawDate = this.newProductSchedule.productUseDate || this.getDefaultDate();
      const formattedDate =
        typeof rawDate === 'string' && rawDate.length === 16 ? `${rawDate}:00` : rawDate;

      const payload = {
        productId: Number(this.newProductSchedule.productId),
        serviceScheduleId: Number(this.newProductSchedule.serviceScheduleId),
        quantity: Number(this.newProductSchedule.quantity),
        productUseDate: formattedDate,
      };

      this.productScheduleService.create(payload).subscribe({
        next: (response) => {
          console.log('Producto de programación creado:', response);
          this.loadProductSchedules();
          this.loadProducts(); // Recargar stock actualizado
          this.resetForm();

          Swal.fire({
            title: '¡Asignado!',
            text: 'El producto se asignó correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error('Error al asignar producto:', err);
          const errorMessage =
            err.error?.message ||
            err.error?.detail ||
            err.message ||
            'No se pudo asignar el producto.';

          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  resetForm(): void {
    this.productSearch = '';
    this.showProductSuggestions = false;
    this.formError = '';
    this.newProductSchedule = {
      productId: null,
      serviceScheduleId: this.selectedServiceScheduleId || null,
      quantity: null,
      productUseDate: this.getDefaultDate(),
    };
  }

  goBackToServiceSchedule(): void {
    this.router.navigate(['/service-schedule']);
  }
}
