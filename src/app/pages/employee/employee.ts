import { Component, OnInit } from '@angular/core';
import { Employee } from '../../models/employee.model';
import { employeeService } from '../../services/employee.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee',
  imports: [FormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class Employees implements OnInit {
  employee: Employee[]=[];

  newEmployee={
    firstName: '',
    lastName: '',
    dni: 0,
    address: '',
    phone: 0,
    role: '',
    emailAddress: '',
    password:'',
    employeeStatus: 0
  };

  constructor(private employeService: employeeService){}

  ngOnInit(): void {
    this.loadEmployee();
  }

  loadEmployee():void{
    this.employeService.getAll().subscribe({
      next:(data)=> {
        this.employee=data;
        console.log(data)
      },
      error(error) {
          console.error('Error al obtener clientes:', error);
      },
    });
  }

  createEmployee():void{
    this.employeService.create(this.newEmployee).subscribe({
      next:(reponse)=>{
        console.log('Empleado creado correctamente',reponse);
        this.loadEmployee();
        this.newEmployee={
          firstName: '',
          lastName: '',
          dni: 0,
          address: '',
          phone: 0,
          role: '',
          emailAddress: '',
          password:'',
          employeeStatus: 0
        };
      },
      error:(error)=>{
        console.log('Error al crear un empleado',error)
      }
    });
  }

}
