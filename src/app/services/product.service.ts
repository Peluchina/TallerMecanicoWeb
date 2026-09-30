import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = '/api/Product';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  create(product: ProductRequest): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  update(productId: number, product: ProductRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, product);
  }

  updateStatus(productId: number, status: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${productId}/status`, {
      productStatus: status.toString(),
    });
  }
}
