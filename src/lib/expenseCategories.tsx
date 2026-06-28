import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import PersonIcon from "@mui/icons-material/Person";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BuildIcon from "@mui/icons-material/Build";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { TranslationKey } from "./i18n";

export interface ExpenseCategory {
  name: string;
  icon: React.ReactNode;
  color: string;
}

export const OTHER_CATEGORY = "Other";

// Picked for this specific business: an individual who leases a plot near a
// bus stand/railway station and runs it themselves — so rent on the leased
// plot and the licence/permit renewal are real recurring costs here, not
// just generic "maintenance".
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { name: "Tea/Snacks", icon: <LocalCafeIcon />, color: "#6D4C41" },
  { name: "Salary", icon: <PersonIcon />, color: "#1565C0" },
  { name: "Electricity", icon: <ElectricBoltIcon />, color: "#FF8F00" },
  { name: "Rent/Lease", icon: <HomeWorkIcon />, color: "#6A1B9A" },
  { name: "Maintenance", icon: <BuildIcon />, color: "#546E7A" },
  { name: "Water", icon: <WaterDropIcon />, color: "#00838F" },
  { name: "Fuel", icon: <LocalGasStationIcon />, color: "#D84315" },
  { name: "Stationery/Printing", icon: <DescriptionIcon />, color: "#8E24AA" },
  { name: "Licence/Tax", icon: <AccountBalanceIcon />, color: "#C62828" },
  { name: OTHER_CATEGORY, icon: <MoreHorizIcon />, color: "#757575" },
];

export function getExpenseCategory(name: string): ExpenseCategory {
  return EXPENSE_CATEGORIES.find((c) => c.name === name) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

// Category names are stored as-is in the database (expense.title), so the
// English name stays the canonical value everywhere — this only maps it to
// a translation key for display.
const CATEGORY_KEYS: Record<string, TranslationKey> = {
  "Tea/Snacks": "expenseCategoryTeaSnacks",
  Salary: "expenseCategorySalary",
  Electricity: "expenseCategoryElectricity",
  "Rent/Lease": "expenseCategoryRentLease",
  Maintenance: "expenseCategoryMaintenance",
  Water: "expenseCategoryWater",
  Fuel: "expenseCategoryFuel",
  "Stationery/Printing": "expenseCategoryStationeryPrinting",
  "Licence/Tax": "expenseCategoryLicenceTax",
  Other: "expenseCategoryOther",
};

export function expenseCategoryKey(name: string): TranslationKey {
  return CATEGORY_KEYS[name] ?? "expenseCategoryOther";
}
