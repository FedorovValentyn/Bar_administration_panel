import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState("");  // Додаємо useState для логіну
    const [password, setPassword] = useState("");  // Додаємо useState для пароля
    const navigate = useNavigate();  // Оголошуємо navigate

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8000/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        if (response.ok) {
            setIsAuthenticated(true);
            navigate("/");  // Перенаправляємо на головну сторінку
        } else {
            alert("Невірний логін або пароль");
        }
    };

    return (
        <div className="auth-container">
            <h2>Вхід</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Логін"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Увійти</button>
            </form>
            <p>Не маєте акаунта? <a href="/register">Зареєструватися</a></p>
        </div>
    );
};

export default Login;
