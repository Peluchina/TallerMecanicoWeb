export interface Supplier{
    supplierId: number;
    ruc: string;
    legalName: string;
    address: string;
    phone: string;
    supplierStatus: number;
  }
  export type SupplierRequest = Omit<Supplier, 'supplierId' | 'supplierStatus'>;