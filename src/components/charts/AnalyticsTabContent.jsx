import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/formatters";

const AnalyticsTabContent = ({
  activeTab,
  categoryBreakdown,
  dailyTrend,
  insights,
  monthlyFinance,
  monthlyTrend,
}) => {
  const safeCategoryBreakdown = categoryBreakdown || [];
  const safeDailyTrend = dailyTrend || [];
  const safeMonthlyTrend = monthlyTrend || [];
  const safeMonthlyFinance = monthlyFinance || [];
  const safeInsights =
    insights ||
    {
      totalExpenses: 0,
      totalIncome: 0,
      netSavings: 0,
      recurringRate: 0,
    };

  if (activeTab === "Overview") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Income",
              value: formatCurrency(safeInsights.totalIncome ?? 0),
            },
            {
              label: "Total Expenses",
              value: formatCurrency(safeInsights.totalExpenses),
            },
            {
              label: "Net Savings",
              value: formatCurrency(safeInsights.netSavings ?? 0),
            },
            {
              label: "Recurring Rate",
              value: formatPercent(safeInsights.recurringRate),
            },
          ].map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-xl font-display font-bold text-primary">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="mb-4 text-base font-display font-semibold text-primary">
            Income vs Expense (12 Months)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={safeMonthlyFinance}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(8,145,178,0.1)"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#0891B2" }} />
              <YAxis tick={{ fontSize: 11, fill: "#0891B2" }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="income" fill="#22C55E" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#22D3EE" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (activeTab === "Categories") {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card-solid p-6">
          <h3 className="mb-4 text-base font-display font-semibold text-primary">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={safeCategoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {safeCategoryBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-3">
            {safeCategoryBreakdown.map((category) => (
              <div
                key={category.name}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}: {formatCurrency(category.value)}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="mb-4 text-base font-display font-semibold text-primary">
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {[...safeCategoryBreakdown]
              .sort((a, b) => b.value - a.value)
              .map((category) => {
                const percent =
                  safeInsights.totalExpenses > 0
                    ? (category.value / safeInsights.totalExpenses) * 100
                    : 0;
                return (
                  <div key={category.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-primary">{category.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(category.value)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/30">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card-solid p-6">
        <h3 className="mb-4 text-base font-display font-semibold text-primary">
          Daily Expense Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={safeDailyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,145,178,0.1)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#0891B2" }} />
            <YAxis tick={{ fontSize: 11, fill: "#0891B2" }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#0891B2"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="mb-4 text-base font-display font-semibold text-primary">
          Savings Rate Trend (12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={safeMonthlyFinance.map((point) => ({
            month: point.month,
            rate:
              point.income > 0
                ? Math.min(100, Math.max(0, (point.net / point.income) * 100))
                : 0,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,145,178,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#0891B2" }} />
            <YAxis tick={{ fontSize: 11, fill: "#0891B2" }} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={{ r: 3, fill: "#06B6D4" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsTabContent;
