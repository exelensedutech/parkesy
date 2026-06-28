"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { alpha } from "@mui/material/styles";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import ExpenseDetailSheet from "@/components/ExpenseDetailSheet";
import PeriodSelect from "@/components/PeriodSelect";
import { getExpenseCategory, expenseCategoryKey } from "@/lib/expenseCategories";
import { useAppStore } from "@/lib/store";
import { Expense } from "@/lib/types";
import { isWithinRange } from "@/lib/calc";
import { DashboardPeriod, getPeriodRange } from "@/lib/dashboardPeriod";

const PRIMARY = "#00658F";

export default function ExpensesPage() {
  const { expenses, language, t } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("today");

  const { start, end } = getPeriodRange(period);
  const periodExpenses = expenses
    .filter((e) => isWithinRange(e.expenseDate, start, end))
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

  const total = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
        {t("expensesLabel")}
      </Typography>

      <PeriodSelect value={period} onChange={setPeriod} />

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
                  {t("total")}
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
        {t("expensesLabel")}
      </Typography>
      <Stack spacing={1.5}>
        {periodExpenses.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t("noExpensesInRange")}
          </Typography>
        )}
        {periodExpenses.map((e) => {
          const cat = getExpenseCategory(e.title);
          return (
            <Card key={e.id} onClick={() => setViewingExpense(e)} sx={{ cursor: "pointer" }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <Avatar sx={{ bgcolor: cat.color, width: 36, height: 36 }}>{cat.icon}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{t(expenseCategoryKey(e.title))}</Typography>
                      {e.note && (
                        <Typography variant="body2" color="text.secondary">
                          {e.note}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(e.expenseDate).toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Kolkata",
                        })}{" "}
                        ·{" "}
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
