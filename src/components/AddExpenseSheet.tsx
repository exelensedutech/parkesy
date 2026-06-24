"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { useAppStore } from "@/lib/store";
import { dateToInputValue } from "@/lib/calc";

export default function AddExpenseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExpense } = useAppStore();
  const today = new Date();
  const monthStart = dateToInputValue(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthEnd = dateToInputValue(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(dateToInputValue(today));

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!value || !title.trim()) return;
    addExpense(value, title.trim(), note.trim() || undefined, new Date(date).toISOString());
    setAmount("");
    setTitle("");
    setNote("");
    setDate(dateToInputValue(today));
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Expense
        </Typography>

        <TextField
          label="Title"
          placeholder="e.g. Maintenance, Tea/Snacks"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Cost"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{
            htmlInput: { min: monthStart, max: monthEnd, style: { textAlign: "left" } },
            inputLabel: { shrink: true },
          }}
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
