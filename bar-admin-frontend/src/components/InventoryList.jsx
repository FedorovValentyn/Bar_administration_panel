import { useEffect, useState } from "react";
import { getInventory } from "../api/api.js";
import { Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";

export default function InventoryList() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        getInventory().then(data => setInventory(data.inventory));
    }, []);

    return (
        <Paper sx={{ padding: 2 }}>
            <h2>Запаси</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Категорія</TableCell>
                        <TableCell>Назва</TableCell>
                        <TableCell>Кількість (л)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {inventory.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
