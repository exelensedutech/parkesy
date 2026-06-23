"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import AppShell from "@/components/AppShell";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { useAppStore } from "@/lib/store";

export default function ExpensesPage() {
  const { expenses } = useAppStore();
  const [open, setOpen] = useState(false);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppShell>
      <Typography variant="h6">Expenses</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Total recorded: ₹{total}
      </Typography>

      <Stack spacing={1.5}>
        {expenses.map((e) => (
          <Card key={e.id}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Stack>
                  <Typography variant="subtitle1">{e.category}</Typography>
                  {e.note && (
                    <Typography variant="body2" color="text.secondary">
                      {e.note}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(e.expenseDate).toLocaleString()} · {e.recordedBy}
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
    </AppShell>
  );
}
