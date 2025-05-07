export interface DiscountPopupProps {
    isVisible: boolean;
    discountCode: string;
    onClose: () => void;
}

export interface DiscountData {
    id: string;
    code: string;
    amount: number;
    expirationDate: Date;
}