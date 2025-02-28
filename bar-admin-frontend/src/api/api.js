import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; // Замініть, якщо потрібно

export const getInventory = async () => {
    const response = await axios.get(`${API_BASE_URL}/inventory/`);
    return response.data;
};

export const getOrders = async () => {
    const response = await axios.get(`${API_BASE_URL}/orders/`);
    return response.data;
};
export const getPurchases = async () => {
    const response = await axios.get(`${API_BASE_URL}/purchases/`);
    return response.data;
};

export const addStock = async (purchaseData) => {
    const response = await axios.post(`${API_BASE_URL}/purchases/`, purchaseData);
    return response.data;
};

// API для отримання списку товарів
export const getDrinks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/drinks`);
        return response.data;
    } catch (error) {
        console.error("Error fetching drinks:", error);
        throw new Error("Failed to fetch drinks");
    }
};


export const makeOrder = async (cocktailName) => {
    try {
        const orderResponse = await axios.post(`${API_BASE_URL}/order/`, { item: cocktailName });

        if (orderResponse.status === 200) {
            const processResponse = await axios.post(`${API_BASE_URL}/place_order`);
            return processResponse.data;
        }
    } catch (error) {
        console.error("Помилка оформлення замовлення:", error.response || error);
        throw new Error(error.response?.data?.detail || "Не вдалося оформити замовлення");
    }
};




