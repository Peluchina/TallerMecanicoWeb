import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerRequest } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  private apiUrl = '/api/Customer';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  create(customer: any): Observable<any> {
    return this.http.post(this.apiUrl, customer);
  }

  update(customerId: number, customer: CustomerRequest | any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${customerId}`, customer);
    }
  
    updateStatus(customerId: number, status: number): Observable<any> {
      return this.http.patch(`${this.apiUrl}/${customerId}/status`, {
        customerStatus: status.toString(),
      });
    }
}
