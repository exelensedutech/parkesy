"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { alpha } from "@mui/material/styles";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import ExpenseDetailSheet from "@/components/ExpenseDetailSheet";
import { getExpenseCategory } from "@/lib/expenseCategories";
import { useAppStore } from "@/lib/store";
import { Expense } from "@/lib/types";

const PRIMARY = "#00658F";

export default function ExpensesPage() {
  const { expenses } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const now = new Date();
  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.expenseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const handleEdit = (expense: Expense) => {
    setViewingExpense(null);
    setEditingExpense(expense);
  };

  const handleAddOpen = () => {
    setEditingExpense(null);
    setAddOpen(true);
  };

  const handleFormClose = () => {
    setAddOpen(false);
    setEditingExpense(null);
  };

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Expenses
        </Typography>
        <Chip label={monthLabel} size="small" variant="outlined" />
      </Stack>

      <Card
        variant="outlined"
        sx={{ mb: 2.5, bgcolor: alpha(PRIMARY, 0.08), borderColor: alpha(PRIMARY, 0.25) }}
      >
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Avatar sx={{ bgcolor: alpha(PRIMARY, 0.15), color: PRIMARY, width: 40, height: 40 }}>
                <ReceiptLongIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total this month
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: PRIMARY }}>
                  ₹{total}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        This Month&apos;s Expenses
      </Typography>
      <Stack spacing={1.5}>
        {monthExpenses.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No expenses recorded this month yet.
          </Typography>
        )}
        {monthExpenses.map((e) => {
          const cat = getExpenseCategory(e.title);
          return (
            <Card key={e.id} onClick={() => setViewingExpense(e)} sx={{ cursor: "pointer" }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: cat.color, width: 36, height: 36 }}>{cat.icon}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{e.title}</Typography>
                      {e.note && (
                        <Typography variant="body2" color="text.secondary">
                          {e.note}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(e.expenseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                        {e.recordedBy}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="h6">₹{e.amount}</Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Fab color="primary" sx={{ position: "fixed", bottom: 88, right: 24 }} onClick={handleAddOpen}>
        <AddIcon />
      </Fab>

      <ExpenseDetailSheet
        expense={viewingExpense}
        onClose={() => setViewingExpense(null)}
        onEdit={handleEdit}
      />

      <AddExpenseSheet
        open={addOpen || !!editingExpense}
        onClose={handleFormClose}
        editingExpense={editingExpense}
      />
    </>
  );
}
