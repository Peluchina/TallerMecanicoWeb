import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-supplier',
  imports: [FormsModule],
  templateUrl: './supplier.html',
  styleUrl: './supplier.css',
})
export class SupplierComponent implements OnInit {
  private readonly authService = inject(AuthService);
  suppliers: Supplier[] = [];

  editingSupplier: Supplier | null = null;
  filterStatus: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  newSupplier = {
    ruc: '',
    legalName: '',
    address: '',
    phone: '',
    supplierStatus: 0,
  };

  constructor(
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSupplier();
  }

  loadSupplier(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener proveedores:', error);
      },
    });
  }

  createSupplier(): void {
    Swal.fire({
      title: '¿Registrar proveedor?',
      text: 'Se creará un nuevo proveedor.',
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
        ruc: this.newSupplier.ruc,
        legalName: this.newSupplier.legalName,
        address: this.newSupplier.address,
        phone: this.newSupplier.phone,
      };

      console.log('Enviando proveedor:', payload);

      this.supplierService.create(payload).subscribe({
        next: (respose) => {
          console.log('Proveedor creado', respose);
          this.supplierService.getAll().subscribe({
            next: (data) => {
              this.suppliers = data;
              this.cdr.detectChanges();
              this.resetForm();

              Swal.fire({
                title: '¡Registrado!',
                text: 'El proveedor se creó correctamente.',
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
          console.error('Error al crear proveedor:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo registrar el proveedor.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    });
  }

  editSupplier(supplier: Supplier): void {
    this.editingSupplier = {
      ...supplier,
    };

    this.newSupplier={
      ruc: supplier.ruc || '',
      legalName: supplier.legalName || '',
      address: supplier.address || '',
      phone: supplier.phone || '',
      supplierStatus: supplier.supplierStatus ?? 0,
    }

  }
  resetForm(): void {
    this.editingSupplier = null;

    this.newSupplier = {
      ruc: '',
      legalName: '',
      address: '',
      phone: '',
      supplierStatus: 0,
    };
  }

  updateSupplier(): void {
      if (!this.editingSupplier) {
        return;
      }
      Swal.fire({
        title: '¿Actualizar proveedor?',
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
        const supplierId = this.editingSupplier!.supplierId;
  
        const payload = {
          ruc: this.newSupplier.ruc,
          legalName: this.newSupplier.legalName,
          address: this.newSupplier.address,
          phone:this.newSupplier.phone,
          supplierStatus: Number(this.newSupplier.supplierStatus),
        };
  
        this.supplierService.update(supplierId, payload).subscribe({
          next: () => {
            const index = this.suppliers.findIndex((s) => s.supplierId === supplierId);
  
            if (index !== -1) {
              this.suppliers[index] = {
                ...this.suppliers[index],
                ruc: payload.ruc,
                legalName: payload.legalName,
                address: payload.address,
                phone: payload.phone,
                supplierStatus: payload.supplierStatus,
              };
  
              this.suppliers = [...this.suppliers];
              this.cdr.detectChanges();
            }
  
            this.resetForm();
            this.cdr.detectChanges();
  
            Swal.fire({
              title: '¡Actualizado!',
              text: 'El proveedor se actualizó correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (error) => {
            console.error('Error al actualizar', error);
  
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el proveedor.',
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
    
      get activeSupplier(): Supplier[] {
        return this.suppliers.filter((supplier) => supplier.supplierStatus === 0);
      }

        updateSupplierStatus(supplierId: number, status: number): void {
          const action = status === 1 ? 'desactivar' : 'activar';
      
          Swal.fire({
            title: `¿Deseas ${action} este proveedor?`,
            text: 'El estado del proveedor será actualizado.',
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
      
              this.supplierService.updateStatus(supplierId, status).subscribe({
                next: () => {
                  const index = this.suppliers.findIndex((s) => s.supplierId === supplierId);
      
                  if (index !== -1) {
                    this.suppliers[index] = {
                      ...this.suppliers[index],
                      supplierStatus: status,
                    };
      
                    this.suppliers = [...this.suppliers];
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
      
        get filteredSupplier(): Supplier[] {
          const visibleSuppliers = this.authService.isAdmin()
            ? this.suppliers
            : this.suppliers.filter((supplier) => supplier.supplierStatus !== 1);

          if (this.filterStatus === 'ACTIVOS') {
            return visibleSuppliers.filter((supplier) => supplier.supplierStatus === 0);
          }
      
          if (this.filterStatus === 'INACTIVOS') {
            return visibleSuppliers.filter((supplier) => supplier.supplierStatus === 1);
          }
      
          return visibleSuppliers;
        }

        onlyNumbers(event: KeyboardEvent): void {
          const key = event.key;
        
          if (
            !/[0-9]/.test(key) &&
            key !== 'Backspace' &&
            key !== 'Delete' &&
            key !== 'ArrowLeft' &&
            key !== 'ArrowRight' &&
            key !== 'Tab'
          ) {
            event.preventDefault();
          }
        }

        onlyLetters(event: KeyboardEvent): void {
          const key = event.key;
        
          if (
            !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key) &&
            key !== 'Backspace' &&
            key !== 'Delete' &&
            key !== 'ArrowLeft' &&
            key !== 'ArrowRight' &&
            key !== 'Tab'
          ) {
            event.preventDefault();
          }
        }
      
        onlyValidCharacters(event: KeyboardEvent): void {
          const key = event.key;
        
          if (['@', '?', '!','_','=','*','/','¿','¡','&'].includes(key)) {
            event.preventDefault();
          }
        }
}
