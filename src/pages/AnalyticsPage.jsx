import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import {
  buildCombinedInsights,
  buildDailyTrend,
  buildMonthlyFinanceSeries,
  buildMonthlyTrend,
  groupByCategory,
} from "@/lib/expense-analytics";
import { formatCurrency } from "@/lib/formatters";
import { listExpenses, mapExpenseToUi } from "@/lib/services/expenseService";
import { getIncomes } from "@/lib/services/incomeService";
import { useCategories } from "@/contexts/CategoryContext";

const AnalyticsTabContent = lazy(
  () => import("@/components/charts/AnalyticsTabContent"),
);

const ChartsFallback = () => (
  <div className="glass-card-solid p-6">
    <p className="animate-pulse text-sm text-muted-foreground">
      Loading charts...
    </p>
  </div>
);

const tabs = ["Overview", "Categories", "Trends", "Forecast"];

const AnalyticsPage = () => {
  const { getCategoryName } = useCategories();
  const [activeTab, setActiveTab] = useState("Overview");
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [expenseRows, incomeRows] = await Promise.all([
          listExpenses({}),
          getIncomes(),
        ]);
        setExpenses(expenseRows.map(mapExpenseToUi));
        setIncomes(incomeRows);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load analytics"));
      }
    };

    loadAnalytics();
  }, []);

  const insights = useMemo(
    () => buildCombinedInsights(expenses, incomes),
    [expenses, incomes],
  );
  const monthlyFinance = useMemo(
    () => buildMonthlyFinanceSeries(expenses, incomes, 12),
    [expenses, incomes],
  );
  const categoryBreakdown = useMemo(
    () => groupByCategory(expenses, getCategoryName),
    [expenses, getCategoryName],
  );
  const dailyTrend = useMemo(() => buildDailyTrend(expenses), [expenses]);
  const monthlyTrend = useMemo(() => buildMonthlyTrend(expenses), [expenses]);
  const forecastAmount = useMemo(() => {
    if (!monthlyTrend.length) {
      return 0;
    }

    const recent = monthlyTrend.slice(-3);
    const total = recent.reduce((sum, month) => sum + month.amount, 0);
    return total / recent.length;
  }, [monthlyTrend]);

  const trendPercent = useMemo(() => {
    if (monthlyTrend.length < 2) {
      return 0;
    }

    const previous = monthlyTrend[monthlyTrend.length - 2].amount;
    const current = monthlyTrend[monthlyTrend.length - 1].amount;

    if (!previous) {
      return 0;
    }

    return ((current - previous) / previous) * 100;
  }, [monthlyTrend]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Analytics
      </h1>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-primary text-primary-foreground" : "glass-card text-primary hover:bg-white/20"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {activeTab === "Forecast" ? (
        <div className="space-y-6">
          <div className="glass-card-solid p-6">
            <h3 className="text-base font-display font-semibold text-primary mb-2">
              Spending Forecast
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on trailing 3-month average with trend adjustment
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/10">
                <p className="text-xs text-muted-foreground">
                  Predicted Next Month
                </p>
                <p className="text-xl font-display font-bold text-primary">
                  {formatCurrency(forecastAmount)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/10">
                <p className="text-xs text-muted-foreground">3-Month Average</p>
                <p className="text-xl font-display font-bold text-primary">
                  {formatCurrency(forecastAmount)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/10">
                <p className="text-xs text-muted-foreground">Trend Direction</p>
                <p className="text-xl font-display font-bold text-warning">
                  {trendPercent >= 0 ? "↗" : "↘"} {trendPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card-solid p-6">
            <h3 className="text-base font-display font-semibold text-primary mb-2">
              Financial Health Score
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth="10"
                    strokeDasharray={`${insights.healthScore * 3.14} ${314 - insights.healthScore * 3.14}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary">
                    {insights.healthScore}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">Good</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your financial health is above average. Keep maintaining your
                  savings rate and stay within budget limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Suspense fallback={<ChartsFallback />}>
          <AnalyticsTabContent
            activeTab={activeTab}
            categoryBreakdown={categoryBreakdown}
            dailyTrend={dailyTrend}
            insights={insights}
            monthlyFinance={monthlyFinance}
            monthlyTrend={monthlyTrend}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AnalyticsPage;
