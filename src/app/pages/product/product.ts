import { ChangeDetectorRef,Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product,ProductRequest  } from '../../models/product.model';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  imports: [FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Products implements OnInit {
  product: Product[]=[];
  newProduct:ProductRequest ={
    productName:'',
    supplierId:0,
    brand:'',
    price:0,
    stock:0
  };

  suppliers: Supplier[]=[];

  editingProduct: Product | null = null;
  filterStatus: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  constructor(
    private productService:ProductService,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.loadProduct();
    this.loadSupplier();
  }

  loadProduct():void{
    this.productService.getAll().subscribe({
      next:(data)=>{
        this.product=data;
        console.log(data);
      },
      error:(error)=>{
        console.error('error al obtener un producto:',error);
      }
    });
  }

  loadSupplier():void{
    this.supplierService.getAll().subscribe({
      next:(data)=>{
        this.suppliers=data;
      }

    })
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(
      s => s.supplierId === supplierId
    );
  
    return supplier?.legalName ?? 'Sin proveedor';
  }


  createProduct(): void{

    Swal.fire({
      title: '¿Registrar producto?',
      text: 'Se creará un nuevo producto.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
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
        }
      });

      this.productService.create(this.newProduct).subscribe({
        next: (response) => {

            console.log('Producto creado:', response);
          
            this.productService.getAll().subscribe({
            next: (data) => {
            
                  // Actualizamos la lista cuando el GET ya terminó
                this.product = data;
            
                  // Forzamos la actualización de la vista
                this.cdr.detectChanges();
            
                  // Limpiamos el formulario
                this.resetForm();
            
      
                Swal.fire({
                  title: '¡Registrado!',
                  text: 'El producto se creó correctamente.',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                });
            },
            error:(error)=>{
              console.error('Error al crear producto:',error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo registrar el producto.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        }
      });  
    })
  }

  editProduct(product: Product): void {
    this.editingProduct = {
      ...product
    };

    this.newProduct = {
      productName: product.productName,
      supplierId: product.supplierId,
      brand: product.brand,
      price: product.price,
      stock: product.stock
    };
  }

    updateProduct(): void {

      if (!this.editingProduct) {
        return;
      }
    
      Swal.fire({
        title: '¿Actualizar producto?',
        text: 'Los cambios serán guardados.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
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
          }
        });
    
        const productId = this.editingProduct!.productId;
    
        this.productService.update(
          productId,
          this.newProduct
        ).subscribe({
    
          next: () => {
    
            // Buscar el producto que está en la tabla
            const index  = this.product.findIndex(
              p => p.productId === productId
            );
    
            if (index !== -1) {

              this.product[index] = {
                ...this.product[index],
                productName: this.newProduct.productName,
                supplierId: this.newProduct.supplierId,
                brand: this.newProduct.brand,
                price: this.newProduct.price,
                stock: this.newProduct.stock
              };

              this.product = [...this.product];
              this.cdr.detectChanges();
            }

            this.resetForm();
            this.cdr.detectChanges();

            Swal.fire({
              title: '¡Actualizado!',
              text: 'El producto se actualizó correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
    
          },
    
          error: (error) => {
    
            console.error('Error al actualizar:', error);
    
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el producto.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
    
          }
    
        });
      });
    }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.editingProduct = null;
    this.newProduct = {
      productName: '',
      supplierId: 0,
      brand: '',
      price: 0,
      stock: 0
    };
  }

  get activeProducts(): Product[] {
    return this.product.filter(
      product => product.productStatus === 0
    );
  }

  updateProductStatus(
    productId: number,
    status: number
  ): void {

    const action = status === 1
    ? 'desactivar'
    : 'activar';

    Swal.fire({
      title: `¿Deseas ${action} este producto?`,
      text: 'El estado del producto será actualizado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
  
      if (result.isConfirmed) {
  
        Swal.fire({
          title: 'Actualizando...',
          text: 'Por favor espera.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

      this.productService
        .updateStatus(productId, status)
        .subscribe({

          next: () => {

          const index = this.product.findIndex(
            p => p.productId === productId
          );

          if (index !== -1) {

            this.product[index] = {
              ...this.product[index],
              productStatus: status
            };

            this.product = [...this.product];
            this.cdr.detectChanges();
          }
            
            Swal.fire({
              title: '¡Actualizado!',
              text: 'El estado se actualizó correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });

          },

          error: (error) => {

            console.error(
              'Error al actualizar estado:',
              error
            );

            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el estado.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });

          }

        });
      }

    });
  }

  get filteredProducts(): Product[] {

    if (this.filterStatus === 'ACTIVOS') {
      return this.product.filter(
        product => product.productStatus === 0
      );
    }
  
    if (this.filterStatus === 'INACTIVOS') {
      return this.product.filter(
        product => product.productStatus === 1
      );
    }
  
    return this.product;
  }

}
