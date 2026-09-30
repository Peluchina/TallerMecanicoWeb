import { Person } from "./person.model";

export interface Customer extends Person {
    customerId: number;
    customerStatus: number;
}

export type CustomerRequest = Omit<Customer, 'customerId' | 'customerStatus'>;