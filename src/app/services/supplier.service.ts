import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Supplier } from "../models/supplier.model";


@Injectable({
    providedIn: 'root'
})
export class SupplierService{
  private apiUrl = '/api/Supplier';
    constructor(private http: HttpClient) {}

    getAll(): Observable<Supplier[]>{
        return this.http.get<Supplier[]>(this.apiUrl);
      }

    create(supplier: any): Observable<any> {
        return this.http.post(this.apiUrl, supplier);
      }
}

