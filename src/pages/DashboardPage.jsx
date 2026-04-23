import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api-error";
import {
  buildDailyTrend,
  buildExpenseInsights,
  buildMonthlyTrend,
  groupByCategory,
} from "@/lib/expense-analytics";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineHeart,
  HiOutlinePlus,
  HiOutlineCollection,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { listExpenses } from "@/lib/services/expenseService";
import { getIncomes, getIncomeTotals } from "@/lib/services/incomeService";
import { getActiveBudgets } from "@/lib/services/budgetService";
import { getUnreadCount } from "@/lib/services/notificationService";
import { getActiveCount } from "@/lib/services/recurringService";

const DashboardChartsSection = lazy(
  () => import("@/components/charts/DashboardChartsSection"),
);

const ChartsFallback = () => (
  <div className="glass-card-solid p-6">
    <p className="animate-pulse text-sm text-muted-foreground">
      Loading charts...
    </p>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [recurringCount, setRecurringCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [expenseData, incomeData, budgetData, notifData, recurData] =
          await Promise.allSettled([
            listExpenses(),
            getIncomeTotals(),
            getActiveBudgets(),
            getUnreadCount(),
            getActiveCount(),
          ]);

        if (expenseData.status === "fulfilled") setExpenses(expenseData.value);
        if (incomeData.status === "fulfilled") setTotalIncome(incomeData.value.totalIncome || incomeData.value.total || 0);
        if (budgetData.status === "fulfilled") setBudgets(budgetData.value);
        if (notifData.status === "fulfilled") setNotifCount(notifData.value.count || 0);
        if (recurData.status === "fulfilled") setRecurringCount(recurData.value.count || 0);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const insights = useMemo(() => buildExpenseInsights(expenses), [expenses]);
  const categoryBreakdown = useMemo(() => groupByCategory(expenses), [expenses]);
  const monthlyExpenseTrend = useMemo(() => buildMonthlyTrend(expenses), [expenses]);
  const dailyTrend = useMemo(() => buildDailyTrend(expenses), [expenses]);
  const topCategories = useMemo(() => categoryBreakdown.slice(0, 3), [categoryBreakdown]);
  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    [expenses],
  );

  const netSavings = totalIncome - insights.totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const kpis = [
    {
      label: "Total Income",
      value: totalIncome,
      icon: HiOutlineTrendingUp,
      format: "currency",
      color: "text-success",
    },
    {
      label: "Total Expenses",
      value: insights.totalExpenses,
      icon: HiOutlineTrendingDown,
      format: "currency",
      color: "text-destructive",
    },
    {
      label: "Net Savings",
      value: netSavings,
      icon: HiOutlineCash,
      format: "currency",
      color: netSavings >= 0 ? "text-success" : "text-destructive",
    },
    {
      label: "Savings Rate",
      value: savingsRate,
      icon: HiOutlineHeart,
      format: "percent",
      color: "text-info",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/expenses"
            className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Expense
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {kpi.label}
              </span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-primary">
              {kpi.format === "currency"
                ? formatCurrency(kpi.value, user?.currency || "USD")
                : formatPercent(kpi.value)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card-solid p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <HiOutlineCollection className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Budgets</p>
            <p className="text-lg font-display font-bold text-primary">{budgets.length}</p>
          </div>
        </div>
        <div className="glass-card-solid p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
            <HiOutlineTrendingUp className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recurring Rules</p>
            <p className="text-lg font-display font-bold text-primary">{recurringCount}</p>
          </div>
        </div>
        <div className="glass-card-solid p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
            <HiOutlineCash className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unread Alerts</p>
            <p className="text-lg font-display font-bold text-primary">{notifCount}</p>
          </div>
        </div>
      </div>

      {/* Savings Rate & Top Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card-solid p-6">
          <h3 className="text-base font-display font-semibold text-primary mb-1">
            Savings Rate
          </h3>
          <p className="text-3xl font-display font-bold text-primary">
            {formatPercent(savingsRate)}
          </p>
          <div className="mt-3 w-full bg-white/30 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${savingsRate >= 0 ? "bg-primary" : "bg-destructive"}`}
              style={{ width: `${Math.min(100, Math.abs(savingsRate))}%` }}
            />
          </div>
        </div>
        <div className="glass-card-solid p-6">
          <h3 className="text-base font-display font-semibold text-primary mb-3">
            Top Categories
          </h3>
          <div className="space-y-3">
            {topCategories.map((category) => {
              const pct =
                insights.totalExpenses > 0
                  ? Math.min((category.value / insights.totalExpenses) * 100, 100)
                  : 0;
              return (
                <div key={category.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-primary font-medium">
                      {category.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(category.value, user?.currency || "USD")} (
                      {pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      {budgets.length > 0 && (
        <div className="glass-card-solid p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-semibold text-primary">
              Budget Progress
            </h3>
            <Link to="/budgets" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {budgets.slice(0, 4).map((budget) => {
              const pct = budget.budgetLimit > 0
                ? Math.min((budget.spentAmount / budget.budgetLimit) * 100, 100)
                : 0;
              const isOver = pct >= 100;
              const isAlert = pct >= (budget.alertThreshold || 80);
              return (
                <div key={budget.budgetId} className="p-3 rounded-lg bg-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary">
                      {budget.categoryName || `Budget #${budget.budgetId}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isOver ? "bg-destructive" : isAlert ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(budget.spentAmount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(budget.budgetLimit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deferred Charts */}
      <Suspense fallback={<ChartsFallback />}>
        <DashboardChartsSection
          categoryBreakdown={categoryBreakdown}
          dailyTrend={dailyTrend}
          monthlyExpenseTrend={monthlyExpenseTrend}
        />
      </Suspense>

      {/* Bottom Row: Recent Transactions */}
      <div className="glass-card-solid p-6">
        <h3 className="text-base font-display font-semibold text-primary mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {!loading &&
            recentExpenses.map((expense) => (
              <div
                key={expense.expenseId}
                className="flex items-center justify-between p-3 rounded-lg bg-white/10"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{expense.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.date}
                  </p>
                </div>
                <span className="text-sm font-semibold text-destructive">
                  -{formatCurrency(expense.amount, user?.currency || "USD")}
                </span>
              </div>
            ))}
          {loading && (
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
