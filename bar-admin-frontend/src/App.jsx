import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import './styles.css';
import './components/Navbar.css';


const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8000/protected/", { credentials: "include" })
            .then(response => setIsAuthenticated(response.ok))
            .catch(() => setIsAuthenticated(false));
    }, []);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register />} />

                {/* Захищені маршрути */}
                <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
                <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
                <Route path="/purchases" element={isAuthenticated ? <Purchases /> : <Navigate to="/login" />} />
                <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
