import { Component, OnInit } from '@angular/core';
import { Service } from '../../models/service.model';
import { ServiceService } from '../../services/service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service',
  imports: [FormsModule],
  templateUrl: './service.html',
  styleUrl: './service.css',
})
export class Services implements OnInit {
  service:Service[]=[];
  newService={
    serviceName:'',
    description: '',
    price: '',
    estimatedDuration:'',
    serviceStatus:'' 
  };

  constructor(private serviceService: ServiceService){}
  ngOnInit(): void {
      this.loadService();
  }

  loadService():void{
    this.serviceService.getAll().subscribe({
      next:(data)=>{
        this.service=data;
        console.log(data);
      },
      error: (error) => {
        console.error('Error al obtener los servicios:', error);
    }
  });
  }

  createService():void{
    this.serviceService.create(this.newService).subscribe({
      next:(response)=>{
        console.log('Cliente creado',response);

        this.loadService();
        this.newService={
          serviceName:'',
          description: '',
          price: '',
          estimatedDuration:'',
          serviceStatus:'' 
        };
      },
      error:(error)=>{
        console.error('Error al crear cliente',error)
      }
    });
  }
  
}
