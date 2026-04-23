import { useState } from "react";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { useAuth } from "@/contexts/AuthContext";
import { listExpenses } from "@/lib/services/expenseService";
import { getIncomes } from "@/lib/services/incomeService";
import { getErrorMessage } from "@/lib/api-error";

const downloadCSV = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          return typeof val === "string" && val.includes(",")
            ? `"${val}"`
            : val;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState("");
  const [error, setError] = useState("");

  const isPaidUser = user?.subscriptionType === "PAID";

  const exportExpensesCsv = async () => {
    if (!isPaidUser) {
      setError("CSV export is available for PAID users only. Upgrade to unlock data exports.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Select both start and end dates to export.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be on or before the end date.");
      return;
    }

    setExporting("expenses");
    setError("");
    try {
      const params = { startDate, endDate };
      const data = await listExpenses(params);
      if (!data.length) {
        setError("No expenses found for the selected period.");
        return;
      }
      const rows = data.map((e) => ({
        Date: e.date,
        Title: e.title,
        Amount: e.amount,
        Currency: e.currency || "USD",
        Category: e.categoryId,
        PaymentMethod: e.paymentMethod,
        Notes: e.notes || "",
      }));
      downloadCSV(rows, `expenses_${startDate}_${endDate}.csv`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to export expenses"));
    } finally {
      setExporting("");
    }
  };

  const exportIncomesCsv = async () => {
    if (!isPaidUser) {
      setError("CSV export is available for PAID users only. Upgrade to unlock data exports.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Select both start and end dates to export.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be on or before the end date.");
      return;
    }

    setExporting("incomes");
    setError("");
    try {
      const data = await getIncomes({ startDate, endDate });
      if (!data.length) {
        setError("No income records found.");
        return;
      }
      const rows = data.map((i) => ({
        Date: i.date,
        Title: i.title,
        Amount: i.amount,
        Source: i.source,
        Notes: i.notes || "",
      }));
      downloadCSV(rows, `incomes_${startDate}_${endDate}.csv`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to export incomes"));
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Reports & Exports
      </h1>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isPaidUser && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Exports are a premium feature. Upgrade to PAID to download CSV reports.
        </div>
      )}

      <div className="glass-card-solid p-6">
        <h3 className="text-base font-display font-semibold text-primary mb-4">
          Export Data
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportExpensesCsv}
            disabled={!!exporting || !isPaidUser}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            <HiOutlineDocumentDownload className="w-4 h-4" />
            {exporting === "expenses" ? "Exporting..." : "Export Expenses CSV"}
          </button>
          <button
            onClick={exportIncomesCsv}
            disabled={!!exporting || !isPaidUser}
            className="flex items-center gap-2 px-5 py-2.5 glass-card text-primary rounded-lg text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <HiOutlineDocumentDownload className="w-4 h-4" />
            {exporting === "incomes" ? "Exporting..." : "Export Income CSV"}
          </button>
        </div>
      </div>

      <div className="glass-card-solid p-6">
        <h3 className="text-base font-display font-semibold text-primary mb-4">
          Quick Export Tips
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Both dates are required so exports match the period you intend</p>
          <p>• Expenses CSV includes category, payment method, and notes</p>
          <p>• Income CSV includes source and recurring status</p>
          <p>• Files are downloaded in standard CSV format, compatible with Excel and Google Sheets</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
