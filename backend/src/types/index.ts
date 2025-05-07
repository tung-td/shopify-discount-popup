export interface Discount {
    id: string;
    code: string;
    amount: number;
    type: 'percentage' | 'fixed_amount';
    startDate: Date;
    endDate: Date;
}

export interface DiscountRequest {
    code: string;
    amount: number;
    type: 'percentage' | 'fixed_amount';
    startDate: Date;
    endDate: Date;
}