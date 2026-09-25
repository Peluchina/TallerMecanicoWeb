import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ServiceSchedule } from "../models/serviceSchedule.model";

@Injectable({
    providedIn:'root',
})
export class ServicesSchedule{
    private apiUrl='/api/ServiceSchedule';

    constructor(private http:HttpClient){}

    getAll():Observable<ServiceSchedule[]>{
        return this.http.get<ServiceSchedule[]>(this.apiUrl);
    }

    create(service:any):Observable<any>{
        return this.http.post(this.apiUrl,service);
    }
}