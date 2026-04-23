import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/api-error";
import { buildMonthlyTrend, groupByCategory } from "@/lib/expense-analytics";
import {
  getAdminCategoryCount,
  getAdminExpenseCount,
  getAdminExpenses,
  getAdminExpenseTotals,
  getAdminIncomeCount,
} from "@/lib/services/adminPlatformService";
import { getUsers } from "@/lib/services/adminUserService";
import { toExpenseDateKey } from "@/lib/expense-analytics";

const AdminDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [counts, setCounts] = useState({ expenses: 0, incomes: 0, categories: 0, users: 0 });
  const [platformExpenseTotal, setPlatformExpenseTotal] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          expenseData,
          expenseCount,
          incomeCount,
          categoryCount,
          expenseTotals,
          users,
        ] = await Promise.all([
          getAdminExpenses(),
          getAdminExpenseCount(),
          getAdminIncomeCount(),
          getAdminCategoryCount(),
          getAdminExpenseTotals(),
          getUsers({ active: true }),
        ]);
        setExpenses(expenseData);
        setPlatformExpenseTotal(expenseTotals?.total ?? null);
        const nonAdminUsers = users.filter((u) => u.role !== "ADMIN").length;
        setCounts({
          expenses: expenseCount.count || 0,
          incomes: incomeCount.count || 0,
          categories: categoryCount.count || 0,
          users: nonAdminUsers,
        });
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load admin dashboard"));
      }
    };

    loadData();
  }, []);

  const monthlyTrend = useMemo(() => buildMonthlyTrend(expenses), [expenses]);
  const topCategories = useMemo(
    () => groupByCategory(expenses).slice(0, 5),
    [expenses],
  );
  const totalAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses],
  );
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return expenses.filter((expense) => {
      const expenseDate = new Date(toExpenseDateKey(expense.date));
      if (Number.isNaN(expenseDate.getTime())) {
        return false;
      }
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [expenses]);

  const platformKpis = [
    { label: "Active Users", value: String(counts.users) },
    { label: "Total Expenses", value: String(counts.expenses) },
    { label: "Total Incomes", value: String(counts.incomes) },
    { label: "Categories", value: String(counts.categories) },
    {
      label: "Platform Expense $",
      value: formatCurrency(
        platformExpenseTotal != null ? Number(platformExpenseTotal) : totalAmount,
      ),
    },
    { label: "This Month Txns", value: String(thisMonthCount || 0) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Admin Dashboard
      </h1>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformKpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="kpi-card"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {k.label}
            </p>
            <p className="text-2xl font-display font-bold text-primary">
              {k.value}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card-solid p-6">
          <h3 className="text-base font-display font-semibold text-primary mb-4">
            Platform Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(8,145,178,0.1)"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#0891B2" }} />
              <YAxis tick={{ fontSize: 11, fill: "#0891B2" }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#0891B2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card-solid p-6">
          <h3 className="text-base font-display font-semibold text-primary mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-3">
            {topCategories.map((category, i) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 rounded-lg bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {category.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(category.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
