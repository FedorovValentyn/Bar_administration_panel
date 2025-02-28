import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Користувач вже існує або помилка реєстрації");
            }

            alert("Реєстрація успішна! Увійдіть у систему.");
            navigate("/login");  // Перенаправлення на вхід
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Реєстрація</h2>
            <form onSubmit={handleRegister}>
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
                <button type="submit">Зареєструватися</button>
            </form>
            <p>Вже маєте акаунт? <a href="/login">Увійти</a></p>
        </div>
    );
};

export default Register;
