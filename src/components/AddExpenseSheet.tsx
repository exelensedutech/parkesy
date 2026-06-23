"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useAppStore } from "@/lib/store";

export default function AddExpenseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExpense, role } = useAppStore();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!value || !category.trim()) return;
    addExpense(value, category.trim(), note.trim() || undefined, role === "owner" ? "Owner" : "Employee");
    setAmount("");
    setCategory("");
    setNote("");
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Expense
        </Typography>

        <TextField
          label="Amount (₹)"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Category"
          placeholder="e.g. Maintenance, Tea/Snacks"
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Note (optional)"
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save Expense
        </Button>
      </Box>
    </Drawer>
  );
}
