import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Employee } from "../models/employee.model";

@Injectable({
    providedIn:'root'
})

export class employeeService{
    private apiUrl='/api/Employee';

    constructor(private http: HttpClient){}
    getAll():Observable<Employee[]>{
        return this.http.get<Employee[]>(this.apiUrl);
    }

    create(employee:any):Observable<any>{
        return this.http.post(this.apiUrl,employee);
    }
}