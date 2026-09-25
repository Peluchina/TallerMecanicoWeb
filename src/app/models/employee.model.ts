import { Person } from "./person.model";

export interface Employee extends Person{
    employeeId: number;
    role: string;
    emailAddress: string;
    password:string;
    employeeStatus: number;
}