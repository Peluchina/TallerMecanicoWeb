import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { Service, ServiceRequest } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = '/api/Service';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  create(service: ServiceRequest | any): Observable<any> {
    return this.http.post(this.apiUrl, service);
  }

  update(serviceId: number, service: ServiceRequest | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${serviceId}`, service);
  }

  updateStatus(serviceId: number, status: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${serviceId}/status`, {
      serviceStatus: status.toString(),
    });
  }
}
