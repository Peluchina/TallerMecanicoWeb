import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ServiceSchedule, ServiceScheduleRequest } from "../models/serviceSchedule.model";

@Injectable({
    providedIn:'root',
})
export class ServicesSchedule{
    private apiUrl='/api/ServiceSchedule';

    constructor(private http:HttpClient){}

    getAll():Observable<ServiceSchedule[]>{
        return this.http.get<ServiceSchedule[]>(this.apiUrl);
    }

    create(serviceSchedule:ServiceScheduleRequest):Observable<any>{
        return this.http.post(this.apiUrl,serviceSchedule);
    }

    update(serviceScheduleId: number, product: ServiceScheduleRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${serviceScheduleId}`, product);
      }
    
      updateStatus(serviceScheduleId: number, status: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${serviceScheduleId}/status`, {
            serviceScheduleStatus: status.toString(),
        });
      }
}