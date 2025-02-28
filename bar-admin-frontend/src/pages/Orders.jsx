import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
    const [cocktailName, setCocktailName] = useState('');
    const [cocktails, setCocktails] = useState([]); // Список коктейлів
    const [message, setMessage] = useState('');

    // Отримати список коктейлів з бекенду при завантаженні сторінки
    useEffect(() => {
        const fetchCocktails = async () => {
            try {
                const response = await axios.get('http://localhost:8000/cocktails/');
                setCocktails(response.data);
            } catch (error) {
                console.error("Не вдалося отримати список коктейлів", error);
            }
        };
        fetchCocktails();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (!cocktailName) {
            setMessage("Оберіть коктейль!");
            return;
        }

        try {
            const orderResponse = await axios.post('http://localhost:8000/order/', {
                item: cocktailName,
                quantity: 1
            });

            if (orderResponse.status === 200) {
                const processResponse = await axios.post('http://localhost:8000/place_order');
                setMessage(processResponse.data.message);
            }

            setCocktailName('');
        } catch (error) {
            setMessage(error.response?.data?.detail || "Щось пішло не так.");
        }
    };

    return (
        <div>
            <h2>Створити замовлення</h2>
            <form onSubmit={handleSubmit}>
                <select value={cocktailName} onChange={(e) => setCocktailName(e.target.value)}>
                    <option value="">Оберіть коктейль</option>
                    {cocktails.map(cocktail => (
                        <option key={cocktail.id} value={cocktail.name}>
                            {cocktail.name}
                        </option>
                    ))}
                </select>
                <button type="submit">Замовити</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Orders;
