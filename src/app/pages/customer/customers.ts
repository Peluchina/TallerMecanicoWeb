import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { first } from 'rxjs';

@Component({
  selector: 'app-customers',
  imports: [FormsModule],
  templateUrl: './customer.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  editingCustomer: Customer | null = null;
  filterStatus: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  newCustomer = {
    firstName: '',
    lastName: '',
    dni: '',
    address: '',
    phone: '',
  };

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
      },
    });
  }

  createCustomer(): void {
    Swal.fire({
      title: '¿Registrar cliente?',
      text: 'Se creará un nuevo cliente.',
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
      const payload = {
        firstName: this.newCustomer.firstName,
        lastname: this.newCustomer.lastName,
        dni: this.newCustomer.dni,
        address: this.newCustomer.address,
        phone: this.newCustomer.phone,
      };

      console.log('Enviando cliente:', payload);

      this.customerService.create(payload).subscribe({
        next: (response) => {
          console.log('Cliente creado:', response);

          this.customerService.getAll().subscribe({
            next: (data) => {
              this.customers = data;
              this.cdr.detectChanges();
              this.resetForm();

              Swal.fire({
                title: '¡Registrado!',
                text: 'El servicio se creó correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
              });
            },
            error: (err) => {
              console.error('Error al actualizar la lista:', err);
              this.resetForm();
            },
          });
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el cliente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  editCustomer(customer: Customer): void {
    this.editingCustomer = {
      ...customer,
    };

    this.newCustomer = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      dni: customer.dni,
      address: customer.address,
      phone: customer.phone,
    };
  }

  resetForm(): void {
    this.editingCustomer = null;

    this.newCustomer = {
      firstName: '',
      lastName: '',
      dni: '',
      address: '',
      phone: '',
    };
  }

  updateCustomer(): void {
    if (!this.editingCustomer) {
      return;
    }
    Swal.fire({
      title: '¿Actualizar cliente?',
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
      const customerId = this.editingCustomer!.customerId;

      const payload = {
        firstName: this.newCustomer.firstName,
        lastName: this.newCustomer.lastName,
        dni: this.newCustomer.dni,
        address: this.newCustomer.address,
        phone: this.newCustomer.phone,
      };

      this.customerService.update(customerId, payload).subscribe({
        next: () => {
          const index = this.customers.findIndex((c) => c.customerId === customerId);

          if (index !== -1) {
            this.customers[index] = {
              ...this.customers[index],
              firstName: payload.firstName,
              lastName: payload.lastName,
              dni: payload.dni,
              address: payload.address,
              phone: payload.phone,
            };

            this.customers = [...this.customers];
            this.cdr.detectChanges();
          }

          this.resetForm();
          this.cdr.detectChanges();

          Swal.fire({
            title: '¡Actualizado!',
            text: 'El cliente se actualizó correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al actualizar', error);

          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el cliente.',
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

  get activeCostumer(): Customer[] {
    return this.customers.filter((customers) => customers.customerStatus === 0);
  }

  updateCustomerStatus(customerId: number, status: number): void {
    const action = status === 1 ? 'desactivar' : 'activar';

    Swal.fire({
      title: `¿Deseas ${action} este cliente?`,
      text: 'El estado del cliente será actualizado.',
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

        this.customerService.updateStatus(customerId, status).subscribe({
          next: () => {
            const index = this.customers.findIndex((c) => c.customerId === customerId);

            if (index !== -1) {
              this.customers[index] = {
                ...this.customers[index],
                customerStatus: status,
              };

              this.customers = [...this.customers];
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

  get filteredCustomers(): Customer[] {
    if (this.filterStatus === 'ACTIVOS') {
      return this.customers.filter((customer) => customer.customerStatus === 0);
    }

    if (this.filterStatus === 'INACTIVOS') {
      return this.customers.filter((customer) => customer.customerStatus === 1);
    }

    return this.customers;
  }
}
