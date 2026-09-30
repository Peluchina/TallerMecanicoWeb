import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee, employeeRequest } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class employeeService {
  private apiUrl = '/api/Employee';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  create(employee: employeeRequest | any): Observable<any> {
    return this.http.post(this.apiUrl, employee);
  }

  update(employeeId: number, employee: employeeRequest | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${employeeId}`, employee);
  }

  updateStatus(employeeId: number, status: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${employeeId}/status`, {
      employeeStatus: status.toString(),
    });
  }
}
