import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';


@Component({
  selector: 'app-supplier',
  imports: [FormsModule],
  templateUrl: './supplier.html',
  styleUrl: './supplier.css',
})
export class SupplierComponent implements OnInit {

    suppliers: Supplier[] = [];
    newSupplier={
      ruc: '',
      legalName: '',
      address: '',
      phone: ''
    };

    constructor(private supplierService: SupplierService){}
    ngOnInit(): void {
        this.loadSupplier();
    }

    loadSupplier(): void{
      this.supplierService.getAll().subscribe({
        next:(data)=>{
          this.suppliers = data;
        },
        error: (error) => {
          console.error('Error al obtener proveedores:', error);
        }
      });
    }

    createSupplier():void{
      this.supplierService.create(this.newSupplier).subscribe({
        
        next:(respose)=>{
          console.log('Proveedor creado',respose);
          this.loadSupplier();
          this.newSupplier={
            ruc:'',
            legalName:'',
            address: '',
            phone: ''
          };
        },
        error:(error)=>{
          console.error('Error al crear cliente', error)
        }
        
      });
    }
}
