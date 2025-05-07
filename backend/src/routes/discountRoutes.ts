import { Router } from 'express';
import { DiscountController } from '../controllers/discountController';

const router = Router();
const discountController = new DiscountController();

export function setDiscountRoutes(app: Router) {
    app.post('/api/discounts', discountController.createDiscount.bind(discountController));
    app.get('/api/discounts', discountController.getDiscounts.bind(discountController));
    app.delete('/api/discounts/:id', discountController.deleteDiscount.bind(discountController));
}