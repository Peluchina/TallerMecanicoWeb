export interface Service {
    serviceId: number;
    serviceName: string;
    description: string;
    price: number;
    estimatedDuration: string;
    serviceStatus: number; 
}

export type ServiceRequest = Omit<Service, 'serviceId' | 'serviceStatus'>;
//export type ProductRequest = ServiceRequest;