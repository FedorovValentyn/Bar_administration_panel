import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Purchases = () => {
    const [drinks, setDrinks] = useState([]);
    const [selectedDrink, setSelectedDrink] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');

    // Отримання списку товарів
    useEffect(() => {
        const fetchDrinks = async () => {
            try {
                const response = await axios.get('http://localhost:8000/drinks/');
                setDrinks(response.data);
            } catch (error) {
                console.error("Помилка отримання товарів:", error);
            }
        };
        fetchDrinks();
    }, []);

    // Функція для оформлення закупівлі
    const handlePurchase = async (event) => {
        event.preventDefault();
        if (!selectedDrink) {
            setMessage("Оберіть товар!");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/purchase/', {
                drink_id: selectedDrink, quantity: quantity
            });

            setMessage(response.data.message);
            setQuantity(1);
        } catch (error) {
            setMessage(error.response?.data?.detail || "Помилка при закупівлі.");
        }
    };

    return (
        <div className="container">
            <h2>Закупівля товарів</h2>
            <form onSubmit={handlePurchase}>
                <select value={selectedDrink} onChange={(e) => setSelectedDrink(e.target.value)}>
                    <option value="">Оберіть товар</option>
                    {drinks.map(drink => (
                        <option key={drink.id} value={drink.id}>
                            {drink.name} (залишок: {drink.quantity})
                        </option>
                    ))}
                </select>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
                <button type="submit">Закупити</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Purchases;
