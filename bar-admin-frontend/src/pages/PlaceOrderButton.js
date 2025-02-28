import React, { useState } from 'react';
import axios from 'axios';

const PlaceOrderButton = ({ cocktailName }) => {
    const [message, setMessage] = useState('');

    const handlePlaceOrder = async () => {
        if (!cocktailName) {
            alert("Введіть назву коктейлю!");
            return;
        }

        try {
            // Спочатку створюємо запис у замовленнях
            const orderResponse = await axios.post('http://localhost:8000/order/', { item: cocktailName });

            if (orderResponse.status === 200) {
                // Після успішного створення замовлення оновлюємо запаси
                const processResponse = await axios.post('http://localhost:8000/place_order');
                setMessage(processResponse.data.message);
                alert(processResponse.data.message);
            }
        } catch (error) {
            console.error("Помилка:", error);
            alert(error.response?.data?.detail || "Не вдалося оформити замовлення.");
        }
    };

    return (
        <div>
            <button onClick={handlePlaceOrder}>
                Place Order
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default PlaceOrderButton;
