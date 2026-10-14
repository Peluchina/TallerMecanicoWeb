import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceSchedule } from '../../models/serviceSchedule.model';
import { ServicesSchedule } from '../../services/serviceSchedule.service';
import { Customer } from '../../models/customer.model';
import { Employee } from '../../models/employee.model';
import { Service } from '../../models/service.model';
import { CustomerService } from '../../services/customer.service';
import { employeeService } from '../../services/employee.service';
import { ServiceService } from '../../services/service.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-service-schedule',
  imports: [FormsModule],
  templateUrl: './service-schedule.html',
  styleUrl: './service-schedule.css',
})
export class ServiceScheduleComponent implements OnInit {
  private readonly authService = inject(AuthService);
  serviceSchedules: ServiceSchedule[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  services: Service[] = [];

  customerSearch = '';
  employeeSearch = '';
  serviceSearch = '';
  showCustomerSuggestions = false;
  showEmployeeSuggestions = false;
  showServiceSuggestions = false;
  formError = '';

  newServiceSchedule = this.createEmptyServiceSchedule();
  editingServiceSchedule: ServiceSchedule | null = null;
  filterStatus: 'TODOS' | 'ACTIVO' | 'REALIZADO' | 'INACTIVOS' = 'TODOS';

  constructor(
    private serviceScheduleService: ServicesSchedule,
    private customerService: CustomerService,
    private employeeService: employeeService,
    private serviceService: ServiceService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  goToAddProducts(serviceSchedule: ServiceSchedule): void {
    this.router.navigate(['/product-schedule'], {
      queryParams: { serviceScheduleId: serviceSchedule.serviceScheduleId },
    });
  }

  ngOnInit(): void {
    this.loadServiceSchedules();
    this.loadCustomers();
    this.loadEmployees();
    this.loadServices();
  }

  get filteredCustomers(): Customer[] {
    const list = this.customers.filter(
      (c) => c.customerStatus === 0 || c.customerStatus === undefined || c.customerStatus === null
    );
    const query = this.customerSearch.trim();
    if (!query) {
      return list;
    }
    return list.filter((customer) =>
      this.matches(query, [
        customer.customerId,
        customer.firstName,
        customer.lastName,
        `${customer.firstName} ${customer.lastName}`,
        customer.dni,
      ]),
    );
  }

  get filteredEmployees(): Employee[] {
    const list = this.employees.filter(
      (e) => e.employeeStatus === 0 || e.employeeStatus === undefined || e.employeeStatus === null
    );
    const query = this.employeeSearch.trim();
    if (!query) {
      return list;
    }
    return list.filter((employee) =>
      this.matches(query, [
        employee.employeeId,
        employee.firstName,
        employee.lastName,
        `${employee.firstName} ${employee.lastName}`,
        employee.dni,
      ]),
    );
  }

  get filteredServices(): Service[] {
    const list = this.services.filter(
      (s) => s.serviceStatus === 0 || s.serviceStatus === undefined || s.serviceStatus === null
    );
    const query = this.serviceSearch.trim();
    if (!query) {
      return list;
    }
    return list.filter((service) =>
      this.matches(query, [
        service.serviceId,
        service.serviceName,
        service.description,
      ]),
    );
  }

  getCustomerName(customerId: number): string {
    const customer = this.customers.find((c) => c.customerId === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : `ID: ${customerId}`;
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find((e) => e.employeeId === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `ID: ${employeeId}`;
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find((s) => s.serviceId === serviceId);
    return service ? service.serviceName : `ID: ${serviceId}`;
  }

  loadServiceSchedules(): void {
    this.serviceScheduleService.getAll().subscribe({
      next: (data) => {
        this.serviceSchedules = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener programaciones:', error);
      },
    });
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al obtener clientes:', error),
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al obtener empleados:', error),
    });
  }

  loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (data) => {
        this.services = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al obtener servicios:', error),
    });
  }

  onCustomerSearchChanged(): void {
    this.showCustomerSuggestions = this.customerSearch.trim().length > 0;
    const selected = this.customers.find((c) => c.customerId === this.newServiceSchedule.customerId);
    const label = selected ? `${selected.firstName} ${selected.lastName} — DNI: ${selected.dni}` : '';
    if (this.customerSearch !== label) {
      this.newServiceSchedule.customerId = null;
    }
  }

  onEmployeeSearchChanged(): void {
    this.showEmployeeSuggestions = this.employeeSearch.trim().length > 0;
    const selected = this.employees.find((e) => e.employeeId === this.newServiceSchedule.employeeId);
    const label = selected ? `${selected.firstName} ${selected.lastName} — DNI: ${selected.dni}` : '';
    if (this.employeeSearch !== label) {
      this.newServiceSchedule.employeeId = null;
    }
  }

  onServiceSearchChanged(): void {
    this.showServiceSuggestions = this.serviceSearch.trim().length > 0;
    const selected = this.services.find((s) => s.serviceId === this.newServiceSchedule.serviceId);
    const label = selected ? selected.serviceName : '';
    if (this.serviceSearch !== label) {
      this.newServiceSchedule.serviceId = null;
    }
  }

  onCustomerFocus(): void {
    this.showCustomerSuggestions = true;
  }

  onEmployeeFocus(): void {
    this.showEmployeeSuggestions = true;
  }

  onServiceFocus(): void {
    this.showServiceSuggestions = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.customer-group')) {
      this.showCustomerSuggestions = false;
    }
    if (!target.closest('.employee-group')) {
      this.showEmployeeSuggestions = false;
    }
    if (!target.closest('.service-group')) {
      this.showServiceSuggestions = false;
    }
  }

  selectCustomer(customer: Customer): void {
    this.newServiceSchedule.customerId = customer.customerId;
    this.customerSearch = `${customer.firstName} ${customer.lastName} — DNI: ${customer.dni}`;
    this.showCustomerSuggestions = false;
    this.formError = '';
  }

  selectEmployee(employee: Employee): void {
    this.newServiceSchedule.employeeId = employee.employeeId;
    this.employeeSearch = `${employee.firstName} ${employee.lastName} — DNI: ${employee.dni}`;
    this.showEmployeeSuggestions = false;
    this.formError = '';
  }

  selectService(service: Service): void {
    this.newServiceSchedule.serviceId = service.serviceId;
    this.serviceSearch = service.serviceName;
    this.showServiceSuggestions = false;
    this.formError = '';
  }

  createServiceSchedule(): void {
    if (
      !this.newServiceSchedule.customerId ||
      !this.newServiceSchedule.employeeId ||
      !this.newServiceSchedule.serviceId ||
      !this.newServiceSchedule.scheduledDate
    ) {
      this.formError = 'Por favor selecciona un cliente, un empleado, un servicio y la fecha programada.';
      return;
    }
    this.formError = '';

    Swal.fire({
      title: '¿Registrar programación?',
      text: 'Se creará una nueva programación de servicio.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      Swal.fire({
        title: 'Registrando...',
        text: 'Por favor espera.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const rawDate = this.newServiceSchedule.scheduledDate;
      const formattedDate =
        typeof rawDate === 'string' && rawDate.length === 16 ? `${rawDate}:00` : rawDate;

      const payload = {
        customerId: Number(this.newServiceSchedule.customerId),
        employeeId: Number(this.newServiceSchedule.employeeId),
        serviceId: Number(this.newServiceSchedule.serviceId),
        scheduledDate: formattedDate,
      };

      this.serviceScheduleService.create(payload).subscribe({
        next: (response) => {
          console.log('Programación creada:', response);
          this.loadServiceSchedules();
          this.resetForm();

          Swal.fire({
            title: '¡Registrado!',
            text: 'La programación se creó correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al crear la programación:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar la programación.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  resetForm(): void {
    this.editingServiceSchedule = null;
    this.customerSearch = '';
    this.employeeSearch = '';
    this.serviceSearch = '';
    this.showCustomerSuggestions = false;
    this.showEmployeeSuggestions = false;
    this.showServiceSuggestions = false;
    this.formError = '';
    this.newServiceSchedule = this.createEmptyServiceSchedule();
  }

  private matches(query: string, values: Array<string | number>): boolean {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return (
      normalizedQuery.length > 0 &&
      values.some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))
    );
  }

  private createEmptyServiceSchedule() {
    return {
      customerId: null as number | null,
      employeeId: null as number | null,
      serviceId: null as number | null,
      scheduledDate: '',
      serviceScheduleStatus: null as number | null,
    };
  }

  editServiceSchedule(serviceSchedule: ServiceSchedule): void {
    this.editingServiceSchedule = {
      ...serviceSchedule,
    };

    let formattedDate = serviceSchedule.scheduledDate || '';
    if (formattedDate.includes(' ')) {
      formattedDate = formattedDate.replace(' ', 'T');
    }
    if (formattedDate.length > 16) {
      formattedDate = formattedDate.substring(0, 16);
    }

    this.newServiceSchedule = {
      customerId: serviceSchedule.customerId || null,
      employeeId: serviceSchedule.employeeId || null,
      serviceId: serviceSchedule.serviceId || null,
      scheduledDate: formattedDate,
      serviceScheduleStatus: serviceSchedule.serviceScheduleStatus ?? 0,
    };

    const customer = this.customers.find((c) => c.customerId === serviceSchedule.customerId);
    this.customerSearch = customer ? `${customer.firstName} ${customer.lastName} — DNI: ${customer.dni}` : '';

    const employee = this.employees.find((e) => e.employeeId === serviceSchedule.employeeId);
    this.employeeSearch = employee ? `${employee.firstName} ${employee.lastName} — DNI: ${employee.dni}` : '';

    const service = this.services.find((s) => s.serviceId === serviceSchedule.serviceId);
    this.serviceSearch = service ? service.serviceName : '';

    this.showCustomerSuggestions = false;
    this.showEmployeeSuggestions = false;
    this.showServiceSuggestions = false;
    this.formError = '';
  }

  updateServiceSchedule(): void {
    if (!this.editingServiceSchedule) {
      return;
    }

    if (
      !this.newServiceSchedule.customerId ||
      !this.newServiceSchedule.employeeId ||
      !this.newServiceSchedule.serviceId ||
      !this.newServiceSchedule.scheduledDate
    ) {
      this.formError = 'Selecciona un cliente, un empleado, un servicio y la fecha programada.';
      return;
    }
    this.formError = '';

    Swal.fire({
      title: '¿Actualizar la programación del servicio?',
      text: 'Los cambios serán guardados.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      Swal.fire({
        title: 'Actualizando...',
        text: 'Por favor espera.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const serviceScheduleId = this.editingServiceSchedule!.serviceScheduleId;
      const rawDate = this.newServiceSchedule.scheduledDate;
      const formattedDate =
        typeof rawDate === 'string' && rawDate.length === 16 ? `${rawDate}:00` : rawDate;

      const newStatus = Number(this.newServiceSchedule.serviceScheduleStatus ?? 0);
      const oldStatus = this.editingServiceSchedule!.serviceScheduleStatus;

      const payload = {
        customerId: Number(this.newServiceSchedule.customerId),
        employeeId: Number(this.newServiceSchedule.employeeId),
        serviceId: Number(this.newServiceSchedule.serviceId),
        scheduledDate: formattedDate,
      };

      this.serviceScheduleService.update(serviceScheduleId, payload).subscribe({
        next: () => {
          if (newStatus !== oldStatus) {
            this.serviceScheduleService.updateStatus(serviceScheduleId, newStatus).subscribe({
              next: () => {
                this.loadServiceSchedules();
                this.resetForm();

                Swal.fire({
                  title: '¡Actualizado!',
                  text: 'La programación se actualizó correctamente.',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false,
                });
              },
              error: (error) => {
                console.error('Error al actualizar el estado de la programación:', error);
                this.loadServiceSchedules();
                this.resetForm();
              }
            });
          } else {
            this.loadServiceSchedules();
            this.resetForm();

            Swal.fire({
              title: '¡Actualizado!',
              text: 'La programación se actualizó correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        },
        error: (error) => {
          console.error('Error al actualizar la programación:', error);

          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la programación.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  get activeServiceSchedule(): ServiceSchedule[] {
    return this.serviceSchedules.filter((serviceSchedule) => serviceSchedule.serviceScheduleStatus === 0);
  }

  private getActionText(status: number): string {
    switch (status) {
      case 0:
        return 'activar';
      case 1:
        return 'desactivar';
      case 2:
        return 'marcar como realizada';
      default:
        return 'actualizar';
    }
  }

  updateServiceScheduleStatus(serviceScheduleId: number, status: number): void {
    const action = this.getActionText(status);

    Swal.fire({
      title: `¿Deseas ${action} esta programación?`,
      text: 'El estado de la programación será actualizado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando...',
          text: 'Por favor espera.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        this.serviceScheduleService.updateStatus(serviceScheduleId, status).subscribe({
          next: () => {
            const index = this.serviceSchedules.findIndex((s) => s.serviceScheduleId === serviceScheduleId);

            if (index !== -1) {
              this.serviceSchedules[index] = {
                ...this.serviceSchedules[index],
                serviceScheduleStatus: status,
              };

              this.serviceSchedules = [...this.serviceSchedules];
              this.cdr.detectChanges();
            }

            Swal.fire({
              title: '¡Actualizado!',
              text: 'El estado se actualizó correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          },

          error: (error) => {
            console.error('Error al actualizar estado:', error);

            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el estado.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          },
        });
      }
    });
  }

  get filteredServiceSchedule(): ServiceSchedule[] {
    const visibleSchedules = this.authService.isAdmin()
      ? this.serviceSchedules
      : this.serviceSchedules.filter((schedule) => schedule.serviceScheduleStatus !== 1);

    if (this.filterStatus === 'ACTIVO') {
      return visibleSchedules.filter((s) => s.serviceScheduleStatus === 0);
    }

    if (this.filterStatus === 'INACTIVOS') {
      return visibleSchedules.filter((s) => s.serviceScheduleStatus === 1);
    }

    if (this.filterStatus === 'REALIZADO') {
      return visibleSchedules.filter((s) => s.serviceScheduleStatus === 2);
    }

    return visibleSchedules;
  }
}
