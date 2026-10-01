import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductSchedule } from '../../models/productSchedule.model';
import { Product } from '../../models/product.model';
import { ServiceSchedule } from '../../models/serviceSchedule.model';
import { ServicesSchedule } from '../../services/serviceSchedule.service';
import { ProductService } from '../../services/product.service';
import { ProductScheduleService } from '../../services/productSchedule.service';

@Component({
  selector: 'app-product-schedule',
  imports: [FormsModule],
  templateUrl: './product-schedule.html',
  styleUrl: './product-schedule.css',
})
export class ProductScheduleComponent implements OnInit {
  productSchedule:ProductSchedule[]=[];
  product:Product[]=[];
  serviceSchecule:ServiceSchedule[]=[];

  productSearch = '';
  serviceScheduleSearch = '';
  showProductSuggestions = false;
  showServiceScheculeSuggestions = false;
  formError = '';

  private createEmptyProductSchedule() {
    return {
      productId: null as number | null,
      serviceScheduleId: null as number | null,
      quantity: null as number | null,
      productScheduleStatus: null as number | null,
    };
  }

  private matches(query: string, values: Array<string | number>): boolean {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery.length > 0 && values.some((value) =>
      String(value).toLocaleLowerCase().includes(normalizedQuery)
    );
  }

  newProductSchedule=this.createEmptyProductSchedule();

  constructor(
    private serviceScheduleService :ServicesSchedule,
    private productScheduleService:ProductScheduleService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ){}

  editingProductSchedule: ProductSchedule | null = null;
  filterStatus: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';

  ngOnInit(): void {
      this.loadProduct();
  }

  get filteredProduct(): Product[] {
      return this.product.filter((product) =>
        this.matches(this.productSearch, [
          product.productId,
          product.productName  
        ])
      );
    }
  
    get selectedProductLabel(): string {
      const product = this.product.find(
        (item) => item.productId === this.newProductSchedule.productId
      );
      return product ? `${product.productName}` : '';
    }
    
    loadProduct(): void {
      this.productService.getAll().subscribe({
        next: (data) => this.product = data,
        error: (error) => console.error('Error al obtener servicios:', error),
      });
    }

    

    onProductSearchChanged(): void {
      this.showProductSuggestions = this.productSearch.trim().length > 0;
      if (this.showProductSuggestions) {
        this.newProductSchedule.productId = null;
      }
    }

    selectProduct(product: Product): void {
        this.newProductSchedule.productId = product.productId;
        this.productSearch = '';
        this.showProductSuggestions = false;
        this.formError = '';
    }

    createProductSchedule():void{

      const payload = {
        productId: this.newProductSchedule.productId,
        serviceScheduleId: this.newProductSchedule.serviceScheduleId,
        quantity: this.newProductSchedule.quantity,
      };


      if (
        this.newProductSchedule.serviceScheduleId === null ||
        this.newProductSchedule.productId === null ||
        this.newProductSchedule.quantity === null
      ) {
        this.formError = 'Selecciona un producto de las sugerencias.';
        return;
      }
  
      this.productScheduleService.create(payload).subscribe({
        next:(response)=>{
          console.log('Programación creada:',response);
          //this.loadProductSchedules();
          this.newProductSchedule = this.createEmptyProductSchedule();
          this.productSearch = '';
          this.formError = '';
        },
        error:(error)=>{
          console.error('Error al crear ',error);
        }
      })
    }
}
