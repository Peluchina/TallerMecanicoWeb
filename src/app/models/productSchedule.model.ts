export interface ProductSchedule {
  productScheduleId: number;
  productId: number;
  serviceScheduleId: number;
  quantity: number;
  productUseDate: string;
  productScheduleStatus: number;
}

export type ProductScheduleRequest = Omit<ProductSchedule, 'productScheduleId' | 'productScheduleStatus'>;