import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminAnalyticsCharts = ({ categoryUsage, volumeTrend }) => {
  const safeCategoryUsage = categoryUsage || [];
  const safeVolumeTrend = volumeTrend || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass-card-solid p-6">
        <h3 className="mb-4 text-base font-display font-semibold text-primary">
          Most Used Categories
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={safeCategoryUsage}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {safeCategoryUsage.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-3">
          {safeCategoryUsage.map((category) => (
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
          Transaction Volume Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={safeVolumeTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,145,178,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#0891B2" }} />
            <YAxis tick={{ fontSize: 11, fill: "#0891B2" }} />
            <Tooltip />
            <Bar dataKey="amount" fill="#0891B2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalyticsCharts;
