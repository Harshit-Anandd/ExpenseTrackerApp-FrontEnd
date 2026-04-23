/**
 * Shared app constants.
 * Keep repeated options here so pages stay small and changes stay centralized.
 */

export const MOBILE_BREAKPOINT = 768;

export const EXPENSE_CATEGORIES = [
  { id: 1, name: "Food", color: "#0891B2" },
  { id: 2, name: "Transport", color: "#06B6D4" },
  { id: 3, name: "Shopping", color: "#22D3EE" },
  { id: 4, name: "Bills", color: "#67E8F9" },
  { id: 5, name: "Health", color: "#A5F3FC" },
  { id: 6, name: "Entertainment", color: "#0E7490" },
];

export const PAYMENT_METHOD_OPTIONS = [
  "All",
  "Cash",
  "Card",
  "UPI",
  "Bank Transfer",
  "Wallet",
];

export const PAYMENT_METHOD_TO_API = {
  Cash: "CASH",
  Card: "CARD",
  UPI: "UPI",
  "Bank Transfer": "BANK_TRANSFER",
  Wallet: "WALLET",
};

export const PAYMENT_METHOD_FROM_API = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  WALLET: "Wallet",
};

export const EXPENSE_CATEGORY_OPTIONS = [
  "All",
  ...EXPENSE_CATEGORIES.map((category) => category.name),
];

export const EXPENSE_CATEGORY_ID_BY_NAME = EXPENSE_CATEGORIES.reduce(
  (accumulator, category) => ({ ...accumulator, [category.name]: category.id }),
  {},
);

export const EXPENSE_CATEGORY_NAME_BY_ID = EXPENSE_CATEGORIES.reduce(
  (accumulator, category) => ({ ...accumulator, [category.id]: category.name }),
  {},
);

export const EXPENSE_CATEGORY_COLOR_BY_NAME = EXPENSE_CATEGORIES.reduce(
  (accumulator, category) => ({ ...accumulator, [category.name]: category.color }),
  {},
);

export const INCOME_SOURCE_OPTIONS = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

export const CURRENCY_OPTIONS = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "CAD",
  "AUD",
  "JPY",
];

export const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
];

export const DEFAULT_EXPENSE_CATEGORY_COLOR = "#0891B2";
