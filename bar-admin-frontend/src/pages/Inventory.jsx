import { useEffect, useState } from "react";
import "../pages/styles/Inventory.css";  // Стилі залишаємо
import toast, { Toaster } from "react-hot-toast";  // Підключаємо бібліотеку для push-up повідомлень

export const getInventory = async () => {
    const response = await fetch("http://localhost:8000/inventory/");
    if (!response.ok) {
        throw new Error("Failed to fetch inventory");
    }
    return response.json();
};

// Функція для отримання товарів, що закінчуються
export const getLowStockItems = async () => {
    const response = await fetch("http://localhost:8000/low_stock/");
    if (!response.ok) {
        throw new Error("Failed to fetch low stock items");
    }
    return response.json();
};

const Inventory = () => {
    const [drinks, setDrinks] = useState([]);

    useEffect(() => {
        getInventory()
            .then(data => setDrinks(data.inventory))
            .catch(console.error);

        // Перевірка запасів кожні 30 секунд
        const interval = setInterval(() => {
            getLowStockItems().then(data => {
                if (data.length > 0) {
                    data.forEach(drink => {
                        toast.error(`❗ ${drink.name} закінчується! Залишилось: ${drink.quantity} л`);
                    });
                }
            }).catch(console.error);
        }, 10000); // 30 секунд

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inventory-container">
            <Toaster position="top-right" reverseOrder={false} />
            <h1>Інвентар напоїв</h1>
            <div className="table-container">
                <table className="inventory-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Категорія</th>
                        <th>Назва</th>
                        <th>Кількість</th>
                    </tr>
                    </thead>
                    <tbody>
                    {drinks.length > 0 ? (
                        drinks.map((drink) => (
                            <tr key={drink.id}>
                                <td>{drink.id}</td>
                                <td>{drink.category}</td>
                                <td>{drink.name}</td>
                                <td>{drink.quantity} л</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-data">Немає даних</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
