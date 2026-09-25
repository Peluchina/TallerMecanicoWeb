export interface Product{
    productId: number;
    productName: string;
    supplierId: number;
    brand: string;
    price: number;
    stock: number;
    productStatus: number;
  }

  export type ProductRequest = Omit<Product, 'productId' | 'productStatus'>;