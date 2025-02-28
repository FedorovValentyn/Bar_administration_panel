import React, { useState } from 'react';
import axios from 'axios';

const Reports = () => {
    const [period, setPeriod] = useState("day");
    const [salesReport, setSalesReport] = useState([]);
    const [purchasesReport, setPurchasesReport] = useState([]);
    const [message, setMessage] = useState("");

    const fetchReports = async () => {
        setMessage("Формування звіту...");

        try {
            const salesResponse = await axios.get(`http://localhost:8000/sales_report/?period=${period}`);
            const purchasesResponse = await axios.get(`http://localhost:8000/purchases_report/?period=${period}`);

            setSalesReport(salesResponse.data);
            setPurchasesReport(purchasesResponse.data);
            setMessage("");
        } catch (error) {
            setMessage("Помилка при отриманні звіту.");
        }
    };

    return (
        <div className="container">
            <h2>Формування звітності</h2>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="day">За день</option>
                <option value="week">За тиждень</option>
                <option value="month">За місяць</option>
            </select>
            <button onClick={fetchReports}>Сформувати звіт</button>

            {message && <p>{message}</p>}

            <h3>Звіт про продажі</h3>
            <table className="styled-table">
                <thead>
                <tr>
                    <th>Коктейль</th>
                    <th>Кількість</th>
                    <th>Сума продажів</th>
                </tr>
                </thead>
                <tbody>
                {salesReport.map((sale, index) => (
                    <tr key={index}>
                        <td>{sale.cocktail}</td>
                        <td>{sale.quantity}</td>
                        <td>${sale.total_sales.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h3>Звіт про закупівлі</h3>
            <table className="styled-table">
                <thead>
                <tr>
                    <th>Товар</th>
                    <th>Кількість</th>
                    <th>Сума витрат</th>
                </tr>
                </thead>
                <tbody>
                {purchasesReport.map((purchase, index) => (
                    <tr key={index}>
                        <td>{purchase.drink}</td>
                        <td>{purchase.quantity}</td>
                        <td>${purchase.total_cost.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Reports;
