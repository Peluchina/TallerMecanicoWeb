import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

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
}
