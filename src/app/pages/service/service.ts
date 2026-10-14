import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Service } from '../../models/service.model';
import { ServiceService } from '../../services/service.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-service',
  imports: [FormsModule],
  templateUrl: './service.html',
  styleUrl: './service.css',
})
export class Services implements OnInit {
  private readonly authService = inject(AuthService);
  service: Service[] = [];

  editingService: Service | null = null;
  filterStatus: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  newService = {
    serviceName: '',
    description: '',
    price: 0,
    estimatedDuration: '',
  };

  constructor(
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadService();
  }

  loadService(): void {
    this.serviceService.getAll().subscribe({
      next: (data) => {
        this.service = data;
        this.cdr.markForCheck();
        console.log(data);
      },
      error: (error) => {
        console.error('Error al obtener los servicios:', error);
      },
    });
  }

  private formatDuration(duration: any): string {
    if (typeof duration === 'string' && duration.trim().length > 0) {
      const parts = duration.trim().split(':');
      if (parts.length === 2) {
        return `${duration.trim()}:00`;
      }
      return duration.trim();
    }
    return '00:00:00';
  }

  createService(): void {
    Swal.fire({
      title: '¿Registrar servicio?',
      text: 'Se creará un nuevo servicio.',
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
        serviceName: this.newService.serviceName,
        description: this.newService.description,
        price: Number(this.newService.price),
        estimatedDuration: this.formatDuration(this.newService.estimatedDuration),
      };

      console.log('Enviando servicio:', payload);

      this.serviceService.create(payload).subscribe({
        next: (response) => {
          console.log('Servicio creado:', response);

          this.serviceService.getAll().subscribe({
            next: (data) => {
              this.service = data;
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
          console.error('Error al crear servicio:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el servicio.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  editService(service: Service): void {
    this.editingService = {
      ...service,
    };

    let durationStr = String(service.estimatedDuration || '');
    if (durationStr.length > 5) {
      durationStr = durationStr.substring(0, 5);
    }

    this.newService = {
      serviceName: service.serviceName,
      description: service.description,
      price: service.price,
      estimatedDuration: durationStr,
    };
  }

  resetForm(): void {
    this.editingService = null;

    this.newService = {
      serviceName: '',
      description: '',
      price: 0,
      estimatedDuration: '',
    };
  }

  updateService(): void {
    if (!this.editingService) {
      return;
    }
    Swal.fire({
      title: '¿Actualizar servicio?',
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
      const serviceId = this.editingService!.serviceId;

      const payload = {
        serviceName: this.newService.serviceName,
        description: this.newService.description,
        price: Number(this.newService.price),
        estimatedDuration: this.formatDuration(this.newService.estimatedDuration),
      };

      this.serviceService.update(serviceId, payload).subscribe({
        next: () => {
          const index = this.service.findIndex((s) => s.serviceId === serviceId);

          if (index !== -1) {
            this.service[index] = {
              ...this.service[index],
              serviceName: payload.serviceName,
              description: payload.description,
              price: payload.price,
              estimatedDuration: payload.estimatedDuration,
            };

            this.service = [...this.service];
            this.cdr.detectChanges();
          }

          this.resetForm();
          this.cdr.detectChanges();

          Swal.fire({
            title: '¡Actualizado!',
            text: 'El servicio se actualizó correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al actualizar', error);

          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el servicio.',
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

  get activeServices(): Service[] {
    return this.service.filter((service) => service.serviceStatus === 0);
  }

  updateServiceStatus(serviceId: number, status: number): void {
    const action = status === 1 ? 'desactivar' : 'activar';

    Swal.fire({
      title: `¿Deseas ${action} este servicio?`,
      text: 'El estado del servicio será actualizado.',
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

        this.serviceService.updateStatus(serviceId, status).subscribe({
          next: () => {
            const index = this.service.findIndex((s) => s.serviceId === serviceId);

            if (index !== -1) {
              this.service[index] = {
                ...this.service[index],
                serviceStatus: status,
              };

              this.service = [...this.service];
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

  get filteredServices(): Service[] {
    const visibleServices = this.authService.isAdmin()
      ? this.service
      : this.service.filter((service) => service.serviceStatus !== 1);

    if (this.filterStatus === 'ACTIVOS') {
      return visibleServices.filter((service) => service.serviceStatus === 0);
    }

    if (this.filterStatus === 'INACTIVOS') {
      return visibleServices.filter((service) => service.serviceStatus === 1);
    }

    return visibleServices;
  }
}
