import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProductSchedule } from "../models/productSchedule.model";


@Injectable({
    providedIn:'root'
})

export class ProductScheduleService{
    private apiUrl='/api/ProductSchedule';
    constructor(private http:HttpClient){}




    
    getAll():Observable<ProductSchedule[]>{
        return this.http.get<ProductSchedule[]>(this.apiUrl);
    }

    create(productSchedule:any):Observable<any>{
        return this.http.post(this.apiUrl,productSchedule)
    }
}