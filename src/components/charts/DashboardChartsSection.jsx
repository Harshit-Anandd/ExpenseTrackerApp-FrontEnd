import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

const DashboardChartsSection = ({
  categoryBreakdown,
  dailyTrend,
  monthlyExpenseTrend,
}) => {
  const safeCategoryBreakdown = categoryBreakdown || [];
  const safeDailyTrend = dailyTrend || [];
  const safeMonthlyExpenseTrend = monthlyExpenseTrend || [];

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card-solid p-6">
          <h3 className="mb-4 text-base font-display font-semibold text-primary">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={safeCategoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
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
          <div className="mt-2 flex flex-wrap gap-3">
            {safeCategoryBreakdown.map((category) => (
              <div
                key={category.name}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-solid p-6">
          <h3 className="mb-4 text-base font-display font-semibold text-primary">
            Monthly Expense Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={safeMonthlyExpenseTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(8,145,178,0.1)"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#0891B2" }} />
              <YAxis tick={{ fontSize: 11, fill: "#0891B2" }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#0891B2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="mb-4 text-base font-display font-semibold text-primary">
          Daily Expense Trend
        </h3>
        <ResponsiveContainer width="100%" height={200}>
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
    </>
  );
};

export default DashboardChartsSection;
