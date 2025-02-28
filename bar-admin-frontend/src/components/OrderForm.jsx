import { useState } from "react";
import { makeOrder } from "../api/api.js";
import { Button, TextField, Paper } from "@mui/material";

export default function OrderForm() {
    const [drinkName, setDrinkName] = useState("");
    const [ingredients, setIngredients] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ingredientsObj = JSON.parse(ingredients);
        const response = await makeOrder({ drink_name: drinkName, ingredients: ingredientsObj });
        alert(response.message);
    };

    return (
        <Paper sx={{ padding: 2 }}>
            <h2>Створити замовлення</h2>
            <form onSubmit={handleSubmit}>
                <TextField label="Назва коктейлю" fullWidth value={drinkName} onChange={(e) => setDrinkName(e.target.value)} />
                <TextField label="Інгредієнти (JSON)" fullWidth value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
                <Button type="submit" variant="contained">Замовити</Button>
            </form>
        </Paper>
    );
}
