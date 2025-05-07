export class DiscountController {
    private discounts: Discount[] = [];

    public createDiscount(req: DiscountRequest, res: any): void {
        const newDiscount: Discount = {
            id: this.discounts.length + 1,
            code: req.body.code,
            amount: req.body.amount,
            type: req.body.type,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
        };
        this.discounts.push(newDiscount);
        res.status(201).json(newDiscount);
    }

    public getDiscounts(req: any, res: any): void {
        res.status(200).json(this.discounts);
    }

    public deleteDiscount(req: any, res: any): void {
        const discountId = parseInt(req.params.id);
        this.discounts = this.discounts.filter(discount => discount.id !== discountId);
        res.status(204).send();
    }
}

interface Discount {
    id: number;
    code: string;
    amount: number;
    type: string;
    startDate: Date;
    endDate: Date;
}

interface DiscountRequest {
    body: {
        code: string;
        amount: number;
        type: string;
        startDate: Date;
        endDate: Date;
    };
}