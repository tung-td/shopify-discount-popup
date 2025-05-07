import React, { useEffect, useState } from 'react';

interface DiscountData {
    id: string;
    title: string;
    description: string;
    discountAmount: number;
}

const StoreFrontUI: React.FC = () => {
    const [discounts, setDiscounts] = useState<DiscountData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await fetch('/api/discounts');
                const data = await response.json();
                setDiscounts(data);
            } catch (error) {
                console.error('Error fetching discounts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscounts();
    }, []);

    if (loading) {
        return <div>Loading discounts...</div>;
    }

    return (
        <div>
            {discounts.length > 0 ? (
                discounts.map(discount => (
                    <div key={discount.id} className="discount-popup">
                        <h2>{discount.title}</h2>
                        <p>{discount.description}</p>
                        <p>Discount Amount: ${discount.discountAmount}</p>
                    </div>
                ))
            ) : (
                <div>No discounts available</div>
            )}
        </div>
    );
};

export default StoreFrontUI;