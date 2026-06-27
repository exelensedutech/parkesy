"use client";

import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjsConfig";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { Expense } from "@/lib/types";
import { EXPENSE_CATEGORIES, OTHER_CATEGORY, getExpenseCategory } from "@/lib/expenseCategories";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

function IconRow({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Avatar sx={{ bgcolor: color, width: 26, height: 26, "& .MuiSvgIcon-root": { fontSize: 16 } }}>
        {icon}
      </Avatar>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

export default function AddExpenseSheet({
  open,
  onClose,
  editingExpense,
}: {
  open: boolean;
  onClose: () => void;
  editingExpense?: Expense | null;
}) {
  const { addExpense, updateExpense } = useAppStore();
  const today = dayjs.tz();
  const monthStart = today.startOf("month");
  const monthEnd = today.endOf("month");

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Dayjs>(today);
  const [dateOpen, setDateOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(editingExpense);
  const isOther = category === OTHER_CATEGORY;
  const selectedCategory = getExpenseCategory(category);

  useEffect(() => {
    if (!open) return;
    if (editingExpense) {
      setCategory(editingExpense.title);
      setAmount(String(editingExpense.amount));
      setNote(editingExpense.note ?? "");
      setDate(dayjs.tz(editingExpense.expenseDate));
    } else {
      setCategory(EXPENSE_CATEGORIES[0].name);
      setAmount("");
      setNote("");
      setDate(today);
    }
    setError("");
  }, [open, editingExpense]);

  const handleSave = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter a valid cost");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (isEditing && editingExpense) {
        await updateExpense(editingExpense.id, value, category, note.trim() || undefined, date.toDate().toISOString());
      } else {
        await addExpense(value, category, note.trim() || undefined, date.toDate().toISOString());
      }
      onClose();
    } catch {
      setError("Could not save — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" gutterBottom>
          {isEditing ? "Edit Expense" : "Add Expense"}
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
          Expense Details
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }}>
              <Select
                value={category}
                onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}
                renderValue={() => (
                  <IconRow icon={selectedCategory.icon} color={selectedCategory.color} label={selectedCategory.name} />
                )}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.name} value={cat.name}>
                    <IconRow icon={cat.icon} color={cat.color} label={cat.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Cost"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              error={Boolean(error)}
              helperText={error || " "}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
              sx={{ mb: 1 }}
            />

            <DatePicker
              label="Date"
              value={date}
              onChange={(newValue) => newValue && setDate(newValue)}
              minDate={monthStart}
              maxDate={monthEnd}
              open={dateOpen}
              onOpen={() => setDateOpen(true)}
              onClose={() => setDateOpen(false)}
              slotProps={{
                textField: { fullWidth: true, onClick: () => setDateOpen(true) },
                field: { readOnly: true },
              }}
              sx={{ mb: 2, width: "100%" }}
            />

            <TextField
              label={isOther ? "Specify expense (optional)" : "Note (optional)"}
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={saving}
          onClick={handleSave}
          sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
        >
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Save Expense"}
        </Button>
      </Box>
    </Drawer>
  );
}
