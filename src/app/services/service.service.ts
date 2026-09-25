import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Service } from "../models/service.model";

@Injectable({
    providedIn:'root',
})

export class ServiceService{
    private apiUrl= '/api/Service'

    constructor( private http:HttpClient){}

    getAll():Observable<Service[]>{
        return this.http.get<Service[]>(this.apiUrl);
    }

    create(service:any):Observable<any>{
        return this.http.post(this.apiUrl,service);
    }
}