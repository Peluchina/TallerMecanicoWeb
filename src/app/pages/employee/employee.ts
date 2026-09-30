import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { employeeService } from '../../services/employee.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee',
  imports: [FormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class Employees implements OnInit {
  employee: Employee[] = [];

  editingEmployee: Employee | null = null;
  filterStatus: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  newEmployee = {
    firstName: '',
    lastName: '',
    dni: '',
    address: '',
    phone: '',
    role: '',
    emailAddress: '',
    password: '',
    employeeStatus: 0,
  };

  constructor(
    private employeService: employeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEmployee();
  }

  loadEmployee(): void {
    this.employeService.getAll().subscribe({
      next: (data) => {
        this.employee = data;
        console.log(data);
      },
      error(error) {
        console.error('Error al obtener empleados:', error);
      },
    });
  }

  createEmployee(): void {
    Swal.fire({
      title: '¿Registrar empleado?',
      text: 'Se creará un nuevo empleado.',
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
        firstName: this.newEmployee.firstName,
        lastName: this.newEmployee.lastName,
        dni: this.newEmployee.dni ? this.newEmployee.dni.toString() : '',
        address: this.newEmployee.address,
        phone: this.newEmployee.phone ? this.newEmployee.phone.toString() : '',
        role: this.newEmployee.role,
        emailAddress: this.newEmployee.emailAddress,
        password: this.newEmployee.password,
      };

      console.log('Enviando empleado:', payload);

      this.employeService.create(payload).subscribe({
        next: (reponse) => {
          console.log('Empleado creado correctamente', reponse);
          this.employeService.getAll().subscribe({
            next: (data) => {
              this.employee = data;
              this.cdr.detectChanges();
              this.resetForm();

              Swal.fire({
                title: '¡Registrado!',
                text: 'El empleado se creó correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
              });
            },
            error: (err) => {
              console.error('Error al actualizar la lista de empleados', err);
              this.resetForm();
            },
          });
        },
        error: (error) => {
          console.error('Error al crear empleado', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar al empleado',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  resetForm(): void {
    this.editingEmployee = null;
    this.newEmployee = {
      firstName: '',
      lastName: '',
      dni: '',
      address: '',
      phone: '',
      role: '',
      emailAddress: '',
      password: '',
      employeeStatus: 0,
    };
  }

  editEmployee(employee: Employee): void {
    this.editingEmployee = {
      ...employee,
    };

    this.newEmployee = {
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      dni: employee.dni || '',
      address: employee.address || '',
      phone: employee.phone || '',
      role: employee.role || '',
      emailAddress: employee.emailAddress || '',
      password: employee.password || '',
      employeeStatus: employee.employeeStatus ?? 0,
    };
  }

  // Backwards compatibility alias if editService is still referenced anywhere
  editService(employee: Employee): void {
    this.editEmployee(employee);
  }

  updateEmployee(): void {
    if (!this.editingEmployee) {
      return;
    }
    Swal.fire({
      title: '¿Actualizar empleado?',
      text: 'Los cambios serán guardados',
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

      const employeeId = this.editingEmployee!.employeeId;

      const payload = {
        firstName: this.newEmployee.firstName,
        lastName: this.newEmployee.lastName,
        dni: this.newEmployee.dni ? this.newEmployee.dni.toString() : '',
        address: this.newEmployee.address,
        phone: this.newEmployee.phone ? this.newEmployee.phone.toString() : '',
        role: this.newEmployee.role,
        emailAddress: this.newEmployee.emailAddress,
        password: this.newEmployee.password,
        employeeStatus: Number(this.newEmployee.employeeStatus),
      };
      this.employeService.update(employeeId, payload).subscribe({
        next: () => {
          const index = this.employee.findIndex((e) => e.employeeId === employeeId);
          if (index !== -1) {
            this.employee[index] = {
              ...this.employee[index],
              firstName: payload.firstName,
              lastName: payload.lastName,
              dni: payload.dni,
              address: payload.address,
              phone: payload.phone,
              role: payload.role,
              emailAddress: payload.emailAddress,
              password: payload.password,
              employeeStatus: payload.employeeStatus,
            };
            this.employee = [...this.employee];
            this.cdr.detectChanges();
          }
          this.resetForm();
          this.cdr.detectChanges();

          Swal.fire({
            title: '¡Actualizado!',
            text: 'El empleado se actualizó correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          console.error('Error al actualizar empleado', error);

          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el empleado',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  cancelEdit() {
    this.resetForm();
  }

  get activeEmployee(): Employee[] {
    return this.employee.filter((employee) => employee.employeeStatus === 0);
  }

  updateEmployeeStatus(employeeId: number, status: number): void {
    const action = status === 1 ? 'desactivar' : 'activar';

    Swal.fire({
      title: `¿Deseas ${action} este empleado?`,
      text: 'El estado del empleado será actualizado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar.',
      cancelButtonText: 'Cancelar.',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando...',
          text: 'Por favor espere.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        this.employeService.updateStatus(employeeId, status).subscribe({
          next: () => {
            const index = this.employee.findIndex((e) => e.employeeId === employeeId);

            if (index !== -1) {
              this.employee[index] = {
                ...this.employee[index],
                employeeStatus: status,
              };

              this.employee = [...this.employee];
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

  get filteredEmployees(): Employee[] {
    if (this.filterStatus === 'ACTIVOS') {
      return this.employee.filter((employee) => employee.employeeStatus === 0);
    }

    if (this.filterStatus === 'INACTIVOS') {
      return this.employee.filter((employee) => employee.employeeStatus === 1);
    }

    return this.employee;
  }
}
