import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier, SupplierRequest } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private apiUrl = '/api/Supplier';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  create(supplier: SupplierRequest): Observable<any> {
    return this.http.post(this.apiUrl, supplier);
  }

  update(supplierId: number, supplier: SupplierRequest | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${supplierId}`, supplier);
  }

  updateStatus(supplierId: number, status: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${supplierId}/status`, {
      supplierStatus: status.toString(),
    });
  }
}
