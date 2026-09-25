import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceSchedule } from '../../models/serviceSchedule.model';
import { ServicesSchedule } from '../../services/serviceSchedule.service';
import { Customer } from '../../models/customer.model';
import { Employee } from '../../models/employee.model';
import { Service } from '../../models/service.model';
import { CustomerService } from '../../services/customer.service';
import { employeeService } from '../../services/employee.service';
import { ServiceService } from '../../services/service.service';


@Component({
  selector: 'app-service-schedule',
  imports: [FormsModule],
  templateUrl: './service-schedule.html',
  styleUrl: './service-schedule.css',
})

export class ServiceScheduleComponent implements OnInit {
  
  serviceSchedules: ServiceSchedule[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  services: Service[] = [];

  customerSearch = '';
  employeeSearch = '';
  serviceSearch = '';
  showCustomerSuggestions = false;
  showEmployeeSuggestions = false;
  showServiceSuggestions = false;
  formError = '';

  newServiceSchedule = this.createEmptyServiceSchedule();

  constructor(
    private serviceScheduleService : ServicesSchedule,
    private customerService: CustomerService,
    private employeeService: employeeService,
    private serviceService: ServiceService
  ){}

  ngOnInit(): void {
      this.loadServiceSchedules();
      this.loadCustomers();
      this.loadEmployees();
      this.loadServices();
  }

  get filteredCustomers(): Customer[] {
    return this.customers.filter((customer) =>
      this.matches(this.customerSearch, [
        customer.customerId,
        customer.firstName,
        customer.lastName,
        `${customer.firstName} ${customer.lastName}`,
        customer.dni,
      ])
    );
  }

  get filteredEmployees(): Employee[] {
    return this.employees.filter((employee) =>
      this.matches(this.employeeSearch, [
        employee.employeeId,
        employee.firstName,
        employee.lastName,
        `${employee.firstName} ${employee.lastName}`,
        employee.dni,
      ])
    );
  }

  get filteredServices(): Service[] {
    return this.services.filter((service) =>
      this.matches(this.serviceSearch, [
        service.serviceId,
        service.serviceName,
        service.description,
      ])
    );
  }

  get selectedCustomerLabel(): string {
    const customer = this.customers.find(
      (item) => item.customerId === this.newServiceSchedule.customerId
    );
    return customer ? `${customer.firstName} ${customer.lastName} — DNI: ${customer.dni}` : '';
  }

  get selectedEmployeeLabel(): string {
    const employee = this.employees.find(
      (item) => item.employeeId === this.newServiceSchedule.employeeId
    );
    return employee ? `${employee.firstName} ${employee.lastName} — DNI: ${employee.dni}` : '';
  }

  get selectedServiceLabel(): string {
    const service = this.services.find(
      (item) => item.serviceId === this.newServiceSchedule.serviceId
    );
    return service ? service.serviceName : '';
  }

  loadServiceSchedules():void{
    this.serviceScheduleService.getAll().subscribe({
      next:(data)=>{
        this.serviceSchedules = data;
    },
      error:(error)=>{
        console.error('Error al obtener programaciones:',error)
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers = data,
      error: (error) => console.error('Error al obtener clientes:', error),
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => this.employees = data,
      error: (error) => console.error('Error al obtener empleados:', error),
    });
  }

  loadServices(): void {
    this.serviceService.getAll().subscribe({
      next: (data) => this.services = data,
      error: (error) => console.error('Error al obtener servicios:', error),
    });
  }

  onCustomerSearchChanged(): void {
    this.showCustomerSuggestions = this.customerSearch.trim().length > 0;
    if (this.showCustomerSuggestions) {
      this.newServiceSchedule.customerId = null;
    }
  }

  onEmployeeSearchChanged(): void {
    this.showEmployeeSuggestions = this.employeeSearch.trim().length > 0;
    if (this.showEmployeeSuggestions) {
      this.newServiceSchedule.employeeId = null;
    }
  }

  onServiceSearchChanged(): void {
    this.showServiceSuggestions = this.serviceSearch.trim().length > 0;
    if (this.showServiceSuggestions) {
      this.newServiceSchedule.serviceId = null;
    }
  }

  selectCustomer(customer: Customer): void {
    this.newServiceSchedule.customerId = customer.customerId;
    this.customerSearch = '';
    this.showCustomerSuggestions = false;
    this.formError = '';
  }

  selectEmployee(employee: Employee): void {
    this.newServiceSchedule.employeeId = employee.employeeId;
    this.employeeSearch = '';
    this.showEmployeeSuggestions = false;
    this.formError = '';
  }

  selectService(service: Service): void {
    this.newServiceSchedule.serviceId = service.serviceId;
    this.serviceSearch = '';
    this.showServiceSuggestions = false;
    this.formError = '';
  }

  createServiceSchedule():void{
    if (
      this.newServiceSchedule.customerId === null ||
      this.newServiceSchedule.employeeId === null ||
      this.newServiceSchedule.serviceId === null
    ) {
      this.formError = 'Selecciona un cliente, un empleado y un servicio de las sugerencias.';
      return;
    }

    this.serviceScheduleService.create(this.newServiceSchedule).subscribe({
      next:(response)=>{
        console.log('Programación creada:',response);
        this.loadServiceSchedules();
        this.newServiceSchedule = this.createEmptyServiceSchedule();
        this.customerSearch = '';
        this.employeeSearch = '';
        this.serviceSearch = '';
        this.formError = '';
      },
      error:(error)=>{
        console.error('Error al crear la programación',error);
      }
    })
  }

  private matches(query: string, values: Array<string | number>): boolean {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery.length > 0 && values.some((value) =>
      String(value).toLocaleLowerCase().includes(normalizedQuery)
    );
  }

  private createEmptyServiceSchedule() {
    return {
      customerId: null as number | null,
      employeeId: null as number | null,
      serviceId: null as number | null,
      scheduledDate: '',
      serviceScheduleStatus: '',
    };
  }
}
