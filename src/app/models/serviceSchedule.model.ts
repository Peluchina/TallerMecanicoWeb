export interface ServiceSchedule{
    serviceScheduleId:number;
    customerId: number;
    employeeId: number;
    serviceId:number;
    scheduledDate:string;
    serviceScheduleStatus:number;    
}

export type ServiceScheduleRequest = Omit<ServiceSchedule, 'serviceScheduleId' | 'serviceScheduleStatus'>;