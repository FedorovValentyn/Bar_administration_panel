import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './Navbar.css';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
        const [username, setUsername] = useState("");  // Збереження імені користувача
        const navigate = useNavigate();

        // Отримуємо ім'я користувача після входу
        useEffect(() => {
                if (isAuthenticated) {
                        fetch("http://localhost:8000/get_user/", { credentials: "include" })
                            .then(response => response.json())
                            .then(data => setUsername(data.username))
                            .catch(() => setUsername(""));
                }
        }, [isAuthenticated]);

        // Функція виходу
        const handleLogout = async () => {
                await fetch("http://localhost:8000/logout/", {
                        method: "POST",
                        credentials: "include"
                });

                setIsAuthenticated(false);
                navigate("/login");
        };

        return (
            <nav className="navbar">
                    <Link to="/">Головна</Link>
                    <Link to="/inventory">Інвентар</Link>
                    <Link to="/orders">Замовлення</Link>
                    <Link to="/purchases">Закупівлі</Link>
                    <Link to="/reports">Звіти</Link>
            </nav>
        );
};

export default Navbar;
