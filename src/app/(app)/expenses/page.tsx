"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { useAppStore } from "@/lib/store";

export default function ExpensesPage() {
  const { expenses } = useAppStore();
  const [open, setOpen] = useState(false);

  const now = new Date();
  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.expenseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <>
      <Typography variant="h6">Expenses — {monthLabel}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Total this month: ₹{total}
      </Typography>

      <Stack spacing={1.5}>
        {monthExpenses.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No expenses recorded this month yet.
          </Typography>
        )}
        {monthExpenses.map((e) => (
          <Card key={e.id}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Stack>
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
                </Stack>
                <Typography variant="h6">₹{e.amount}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Fab color="primary" sx={{ position: "fixed", bottom: 88, right: 24 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <AddExpenseSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
