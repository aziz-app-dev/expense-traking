import { ExpanseCatType } from "./model";

export const expenseCategories: ExpanseCatType = {
  groceries: {
    label: "Groceries",
    value: "groceries",
    icon: "cart-outline",
    bgColor: "#4B5563",
  },
  rent: {
    label: "Rent",
    value: "rent",
    icon: "home-outline",
    bgColor: "#075985",
  },
  utilities: {
    label: "Utilities",
    value: "utilities",
    icon: "flash-outline",
    bgColor: "#ca8a04",
  },
  transportation: {
    label: "Transportation",
    value: "transportation",
    icon: "car-outline",
    bgColor: "#b45309",
  },
  entertainment: {
    label: "Entertainment",
    value: "entertainment",
    icon: "film-outline",
    bgColor: "#0f766e",
  },
  dining: {
    label: "Dining",
    value: "dining",
    icon: "restaurant-outline",
    bgColor: "#be185d",
  },
  health: {
    label: "Health",
    value: "health",
    icon: "heart-outline",
    bgColor: "#e11d48",
  },
  insurance: {
    label: "Insurance",
    value: "insurance",
    icon: "shield-checkmark-outline",
    bgColor: "#404040",
  },
  savings: {
    label: "Savings",
    value: "savings",
    icon: "wallet-outline",
    bgColor: "#065F46",
  },
  clothing: {
    label: "Clothing",
    value: "clothing",
    icon: "shirt-outline",
    bgColor: "#7c3aed",
  },
  personal: {
    label: "Personal",
    value: "personal",
    icon: "person-outline",
    bgColor: "#a21caf",
  },
  others: {
    label: "Others",
    value: "others",
    icon: "ellipsis-horizontal-outline",
    bgColor: "#525252",
  },
};


export const incomeCategories: ExpanseCatType = {
  salary: {
    label: "Salary",
    value: "salary",
    icon: "cash-outline",
    bgColor: "#16a34a", // green
  },
  business: {
    label: "Business",
    value: "business",
    icon: "briefcase-outline",
    bgColor: "#0ea5e9", // blue
  },
  investments: {
    label: "Investments",
    value: "investments",
    icon: "trending-up-outline",
    bgColor: "#f59e0b", // amber
  },
  gifts: {
    label: "Gifts",
    value: "gifts",
    icon: "gift-outline",
    bgColor: "#db2777", // pink
  },
  freelance: {
    label: "Freelance",
    value: "freelance",
    icon: "laptop-outline",
    bgColor: "#8b5cf6", // violet
  },
  interest: {
    label: "Interest",
    value: "interest",
    icon: "card-outline",
    bgColor: "#14b8a6", // teal
  },
  refunds: {
    label: "Refunds",
    value: "refunds",
    icon: "arrow-undo-outline",
    bgColor: "#f97316", // orange
  },
  others: {
    label: "Others",
    value: "others",
    icon: "ellipsis-horizontal-outline",
    bgColor: "#6b7280", // gray
  },
};

export const transtionType = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];
