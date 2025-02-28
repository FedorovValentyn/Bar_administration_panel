import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(""); // Очищення помилки перед запитом

        const url = isLogin ? "http://localhost:8000/login/" : "http://localhost:8000/register/";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                credentials: "include"  // Передаємо кукі для сесії
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Помилка авторизації");
            }

            if (isLogin) {
                setIsAuthenticated(true);
                navigate("/"); // Перенаправлення на головну
            } else {
                alert("Реєстрація успішна! Тепер увійдіть.");
                setIsLogin(true);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{isLogin ? "Вхід" : "Реєстрація"}</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleAuth}>
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
                    <button type="submit">{isLogin ? "Увійти" : "Зареєструватися"}</button>
                </form>
                <p onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                    {isLogin ? "Не маєте акаунта? Зареєструватися" : "Вже маєте акаунт? Увійти"}
                </p>
            </div>
        </div>
    );
};

export default Auth;
