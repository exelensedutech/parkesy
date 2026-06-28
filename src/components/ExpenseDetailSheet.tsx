"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import SheetHandle from "./SheetHandle";
import { Expense } from "@/lib/types";
import { getExpenseCategory, expenseCategoryKey } from "@/lib/expenseCategories";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";
import { useAppStore } from "@/lib/store";

export default function ExpenseDetailSheet({
  expense,
  onClose,
  onEdit,
}: {
  expense: Expense | null;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
}) {
  const { language, t } = useAppStore();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  if (!expense) return null;

  const cat = getExpenseCategory(expense.title);

  const handleEdit = () => {
    setMenuAnchor(null);
    onEdit(expense);
  };

  return (
    <Drawer anchor="bottom" open={!!expense} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar sx={{ bgcolor: cat.color, width: 40, height: 40 }}>{cat.icon}</Avatar>
            <Typography variant="h6">{t(expenseCategoryKey(expense.title))}</Typography>
          </Stack>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="More options">
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("edit")}</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="text.secondary">
          {t("cost")}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          ₹{expense.amount}
        </Typography>

        <Stack spacing={0.75}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              {t("date")}
            </Typography>
            <Typography variant="body2">
              {new Date(expense.expenseDate).toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </Typography>
          </Stack>
          {expense.note && (
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                {t("note")}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "right", maxWidth: "60%" }}>
                {expense.note}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              {t("createdBy")}
            </Typography>
            <Typography variant="body2">{expense.recordedBy}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
