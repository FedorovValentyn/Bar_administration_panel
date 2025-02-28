import { useState } from "react";
import { addStock } from "../api/api.js";
import { Button, TextField, Paper } from "@mui/material";

export default function PurchaseForm() {
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await addStock({ item_name: itemName, quantity: parseFloat(quantity) });
        alert(response.message);
    };

    return (
        <Paper sx={{ padding: 2 }}>
            <h2>Додати запаси</h2>
            <form onSubmit={handleSubmit}>
                <TextField label="Назва напою" fullWidth value={itemName} onChange={(e) => setItemName(e.target.value)} />
                <TextField label="Кількість (л)" fullWidth value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <Button type="submit" variant="contained">Додати</Button>
            </form>
        </Paper>
    );
}
