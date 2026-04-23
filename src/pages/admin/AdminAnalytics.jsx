import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import { buildMonthlyTrend, groupByCategory } from "@/lib/expense-analytics";
import { getAdminExpenses } from "@/lib/services/adminPlatformService";

const AdminAnalyticsCharts = lazy(
  () => import("@/components/charts/AdminAnalyticsCharts"),
);

const ChartsFallback = () => (
  <div className="glass-card-solid p-6">
    <p className="animate-pulse text-sm text-muted-foreground">
      Loading charts...
    </p>
  </div>
);

const AdminAnalytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAdminExpenses();
        setExpenses(data);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load admin analytics"));
      }
    };

    loadAnalytics();
  }, []);

  const categoryUsage = useMemo(() => groupByCategory(expenses), [expenses]);
  const volumeTrend = useMemo(() => buildMonthlyTrend(expenses), [expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Platform Analytics
      </h1>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Suspense fallback={<ChartsFallback />}>
        <AdminAnalyticsCharts
          categoryUsage={categoryUsage}
          volumeTrend={volumeTrend}
        />
      </Suspense>
    </div>
  );
};
var AdminAnalytics_default = AdminAnalytics;
export { AdminAnalytics_default as default };
