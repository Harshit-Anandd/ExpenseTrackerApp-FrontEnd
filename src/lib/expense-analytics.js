/**
 * Expense analytics utility functions.
 * Category resolution is done via a categoryMap (from CategoryContext).
 */
const sumBy = (items, selector) =>
  items.reduce((total, item) => total + Number(selector(item) || 0), 0);

/** Normalize API date (string, array, or Date) to yyyy-MM-dd for comparisons. */
const toExpenseDateKey = (value) => {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return "";
};

/**
 * Group expenses by category for chart display.
 * @param {Array} expenses - list of expenses
 * @param {Function} getCategoryName - function to resolve categoryId to name
 * @param {Function} getCategoryColor - function to resolve categoryId to color
 */
const groupByCategory = (expenses, getCategoryName, getCategoryColor) => {
  const totalsByCategory = expenses.reduce((accumulator, expense) => {
    const categoryName = getCategoryName
      ? getCategoryName(expense.categoryId)
      : `Category #${expense.categoryId}`;

    return {
      ...accumulator,
      [categoryName]: (accumulator[categoryName] || 0) + Number(expense.amount || 0),
    };
  }, {});

  return Object.entries(totalsByCategory)
    .map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor ? getCategoryColor(name) : "#0891B2",
    }))
    .sort((a, b) => b.value - a.value);
};

const buildDailyTrend = (expenses, days = 30) => {
  const today = new Date();
  const points = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);

    const amount = sumBy(
      expenses.filter((expense) => toExpenseDateKey(expense.date) === key),
      (expense) => expense.amount,
    );

    points.push({ day: String(date.getDate()), amount });
  }

  return points;
};

const buildMonthlyTrend = (expenses, months = 6) => {
  const now = new Date();
  const points = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    const amount = sumBy(
      expenses.filter((expense) => {
        const expenseDate = new Date(toExpenseDateKey(expense.date));
        if (Number.isNaN(expenseDate.getTime())) {
          return false;
        }
        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === year
        );
      }),
      (expense) => expense.amount,
    );

    points.push({ month, amount });
  }

  return points;
};

const buildExpenseInsights = (expenses) => {
  const totalExpenses = sumBy(expenses, (expense) => expense.amount);
  const recurringCount = expenses.filter((expense) => expense.isRecurring).length;
  const transactionCount = expenses.length;

  return {
    totalExpenses,
    recurringCount,
    transactionCount,
    averageExpense: transactionCount ? totalExpenses / transactionCount : 0,
    recurringRate: transactionCount ? (recurringCount / transactionCount) * 100 : 0,
    healthScore: Math.max(0, Math.round(100 - Math.min(90, totalExpenses / 50))),
  };
};

/**
 * Per-month income and expense totals (aligned month labels) for charts.
 */
const buildMonthlyFinanceSeries = (expenses, incomes, months = 12) => {
  const now = new Date();
  const points = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    const expense = sumBy(
      expenses.filter((e) => {
        const d = new Date(toExpenseDateKey(e.date));
        if (Number.isNaN(d.getTime())) {
          return false;
        }
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      }),
      (e) => e.amount,
    );

    const income = sumBy(
      incomes.filter((i) => {
        const d = new Date(toExpenseDateKey(i.date));
        if (Number.isNaN(d.getTime())) {
          return false;
        }
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      }),
      (i) => i.amount,
    );

    points.push({
      month,
      income,
      expense,
      net: income - expense,
    });
  }

  return points;
};

/**
 * Expense KPIs plus income totals and net savings for analytics overview.
 */
const buildCombinedInsights = (expenses, incomes) => {
  const base = buildExpenseInsights(expenses);
  const totalIncome = sumBy(incomes, (i) => i.amount);
  const netSavings = totalIncome - base.totalExpenses;
  let healthScore = base.healthScore;
  if (totalIncome > 0) {
    healthScore = Math.max(
      0,
      Math.min(100, Math.round(100 - (base.totalExpenses / totalIncome) * 70)),
    );
  }

  return {
    ...base,
    totalIncome,
    netSavings,
    healthScore,
  };
};

export {
  buildCombinedInsights,
  buildDailyTrend,
  buildExpenseInsights,
  buildMonthlyFinanceSeries,
  buildMonthlyTrend,
  groupByCategory,
  sumBy,
  toExpenseDateKey,
};
