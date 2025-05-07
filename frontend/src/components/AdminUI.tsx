import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUI: React.FC = () => {
    const [discounts, setDiscounts] = useState([]);
    const [newDiscount, setNewDiscount] = useState({ code: '', amount: 0 });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const response = await axios.get('/api/discounts');
            setDiscounts(response.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    };

    const handleCreateDiscount = async () => {
        try {
            await axios.post('/api/discounts', newDiscount);
            fetchDiscounts();
            setNewDiscount({ code: '', amount: 0 });
        } catch (error) {
            console.error('Error creating discount:', error);
        }
    };

    const handleDeleteDiscount = async (id: string) => {
        try {
            await axios.delete(`/api/discounts/${id}`);
            fetchDiscounts();
        } catch (error) {
            console.error('Error deleting discount:', error);
        }
    };

    return (
        <div>
            <h1>Admin Discount Management</h1>
            <div>
                <h2>Create Discount</h2>
                <input
                    type="text"
                    placeholder="Discount Code"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Discount Amount"
                    value={newDiscount.amount}
                    onChange={(e) => setNewDiscount({ ...newDiscount, amount: Number(e.target.value) })}
                />
                <button onClick={handleCreateDiscount}>Create Discount</button>
            </div>
            <div>
                <h2>Existing Discounts</h2>
                <ul>
                    {discounts.map((discount: any) => (
                        <li key={discount.id}>
                            {discount.code} - ${discount.amount}
                            <button onClick={() => handleDeleteDiscount(discount.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminUI;