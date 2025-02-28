import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Home = () => {
    const [stats, setStats] = useState({});
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("week"); // Додаємо вибір періоду

    useEffect(() => {
        fetchStats();
    }, [period]);

    console.log("Отримані дані для графіка:", trendData);


    const fetchStats = async () => {
        setLoading(true);
        try {
            const statsResponse = await axios.get('http://localhost:8000/dashboard_stats/');
            const trendResponse = await axios.get(`http://localhost:8000/sales_trend/?period=${period}`);
            setStats(statsResponse.data);
            setTrendData(trendResponse.data);
        } catch (error) {
            console.error("Помилка отримання статистики:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>📊 Статистика бару</h2>
            <p><strong>💰 Загальний дохід:</strong> ${stats.total_sales?.toFixed(2)}</p>
            <p><strong>💸 Загальні витрати:</strong> ${stats.total_purchases?.toFixed(2)}</p>
            <p><strong>📈 Чистий прибуток:</strong> ${stats.net_profit?.toFixed(2)}</p>
            <p><strong>🍹 Найпопулярніший коктейль:</strong> {stats.most_popular}</p>

            <div>
                <label>📅 Обрати період:</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="day">За день</option>
                    <option value="week">За тиждень</option>
                    <option value="month">За місяць</option>
                </select>
            </div>

            <div className="charts-container">
                <div className="chart">
                    <h3>📅 Продажі vs Закупівлі ({period})</h3>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#28a745" strokeWidth={3} dot={{ r: 5 }} />
                                <Line type="monotone" dataKey="purchases" stroke="#dc3545" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p>Немає даних для відображення</p>
                    )}
                </div>

                <div className="chart">
                    <h3>💵 Динаміка доходу ({period})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" stroke="#007bff" fillOpacity={0.4} fill="#007bff" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Home;
