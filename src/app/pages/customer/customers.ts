import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  imports: [FormsModule],
  templateUrl: './customer.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {

  customers: Customer[] = [];

  newCustomer = {
    firstName: '',
    lastName: '',
    dni: '',
    address: '',
    phone: ''
  };

  constructor(private customerService: CustomerService) {}

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
      }
    });

  }

  createCustomer(): void {

    this.customerService.create(this.newCustomer).subscribe({
  
      next: (response) => {
  
        console.log('Cliente creado:', response);
  
        this.loadCustomers();
  
        this.newCustomer = {
          firstName: '',
          lastName: '',
          dni: '',
          address: '',
          phone: ''
        };
  
      },
  
      error: (error) => {
  
        console.error('Error al crear cliente:', error);
  
      }
  
    });
  
  }
}
