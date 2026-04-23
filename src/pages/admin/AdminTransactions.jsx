import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getAdminExpenses } from "@/lib/services/adminPlatformService";

const AdminTransactions = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getAdminExpenses();
        setExpenses(data);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load transactions"));
      }
    };

    loadTransactions();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Transaction Audit
      </h1>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="glass-card-solid p-6">
        <h3 className="text-base font-display font-semibold text-primary mb-4">
          Visible Expenses
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Category Id
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.expenseId}
                  className="border-b border-border/10 hover:bg-white/10"
                >
                  <td className="px-4 py-3 text-sm text-primary">{expense.title}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {expense.categoryId}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-destructive text-right">
                    -{formatCurrency(expense.amount, expense.currency || "USD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
var AdminTransactions_default = AdminTransactions;
export { AdminTransactions_default as default };
