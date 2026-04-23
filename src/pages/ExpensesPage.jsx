import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import {
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/constants";
import { useCategories } from "@/contexts/CategoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  buildCreatePayload,
  buildUpdatePayload,
  createExpense,
  deleteExpense,
  listExpenses,
  mapExpenseToUi,
  updateExpense,
  uploadReceipt,
} from "@/lib/services/expenseService";

const INITIAL_FORM = {
  title: "",
  amount: "",
  categoryId: "",
  date: "",
  paymentMethod: "Card",
  notes: "",
  isRecurring: false,
};

/**
 * Expense management page backed by expense-service APIs.
 */
const ExpensesPage = () => {
  const { user } = useAuth();
  const { expenseCategories, getCategoryName } = useCategories();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    const filters = {};
    if (search.trim()) {
      filters.keyword = search.trim();
    } else if (paymentMethodFilter !== "All") {
      filters.paymentMethod =
        paymentMethodFilter === "Bank Transfer"
          ? "BANK_TRANSFER"
          : paymentMethodFilter.toUpperCase();
    } else if (categoryFilter !== "All") {
      filters.categoryId = categoryFilter;
    }

    try {
      const response = await listExpenses(filters);
      setExpenses(response.map(mapExpenseToUi));
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load expenses"));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, paymentMethodFilter, search]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const total = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }, [expenses]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId("");
    setReceiptFile(null);
    setForm(INITIAL_FORM);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      categoryId: expense.categoryId ? String(expense.categoryId) : "",
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || "",
      isRecurring: expense.isRecurring,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount || !form.date || !form.categoryId) {
      setError("Title, amount, category, and date are required");
      return;
    }

    const amountTrim = String(form.amount ?? "")
      .trim()
      .replace(",", ".");
    const amountValue = Number.parseFloat(amountTrim);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Amount must be a valid positive number");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const currency = user?.currency || "USD";
      let savedExpense;

      if (editingId) {
        const payload = buildUpdatePayload(form, currency);
        savedExpense = await updateExpense(editingId, payload);
      } else {
        const payload = buildCreatePayload(form, currency);
        savedExpense = await createExpense(payload);
      }

      if (receiptFile) {
        savedExpense = await uploadReceipt(savedExpense.expenseId, receiptFile);
      }

      resetForm();
      setExpenses((previous) => {
        const mappedExpense = mapExpenseToUi(savedExpense);
        const updated = previous.filter(
          (expense) => expense.id !== mappedExpense.id,
        );
        return [mappedExpense, ...updated];
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to save expense"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Delete this expense?")) {
      return;
    }

    try {
      await deleteExpense(id);
      setExpenses((previous) => previous.filter((expense) => expense.id !== id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete expense"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(total, user?.currency || "USD")} · {expenses.length}{" "}
            transactions
          </p>
        </div>

        <button
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          onClick={openCreateForm}
          type="button"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card-solid flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="glass-input w-full rounded-lg py-2 pl-9 pr-4 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search expenses..."
            value={search}
          />
        </div>

        <select
          className="glass-input rounded-lg px-3 py-2 text-sm text-primary focus:outline-none"
          onChange={(event) => setCategoryFilter(event.target.value)}
          value={categoryFilter}
        >
          {[{ categoryId: "All", name: "All" }, ...expenseCategories].map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
          ))}
        </select>

        <select
          className="glass-input rounded-lg px-3 py-2 text-sm text-primary focus:outline-none"
          onChange={(event) => setPaymentMethodFilter(event.target.value)}
          value={paymentMethodFilter}
        >
          {PAYMENT_METHOD_OPTIONS.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Expense Table */}
      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                  Method
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                expenses.map((expense, index) => (
                <motion.tr
                  animate={{ opacity: 1 }}
                  className="border-b border-border/10 transition-colors hover:bg-white/10"
                  initial={{ opacity: 0 }}
                  key={expense.id}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-primary">
                    {expense.title}
                    {expense.isRecurring && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        🔄
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="glass-button rounded-full px-2 py-1 text-xs text-primary">
                      {getCategoryName(expense.categoryId)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-destructive">
                    -
                    {formatCurrency(
                      expense.amount,
                      expense.currency || user?.currency || "USD",
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded-lg p-1.5 text-primary transition-colors hover:bg-white/20"
                      onClick={() => openEditForm(expense)}
                      type="button"
                    >
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>

                    <button
                      className="ml-1 rounded-lg p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                      onClick={() => handleDeleteExpense(expense.id)}
                      type="button"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
                ))}
              {loading && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                    colSpan={6}
                  >
                    Loading expenses...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={resetForm}
          />

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-solid relative z-10 w-full max-w-lg p-6"
            initial={{ opacity: 0, scale: 0.95 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-primary">
                {editingId ? "Edit" : "Add"} Expense
              </h2>
              <button
                className="text-muted-foreground hover:text-primary"
                onClick={resetForm}
                type="button"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="Title"
                value={form.title}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Amount"
                  type="number"
                  value={form.amount}
                />

                <input
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      date: event.target.value,
                    }))
                  }
                  type="date"
                  value={form.date}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      categoryId: event.target.value,
                    }))
                  }
                  value={form.categoryId}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>

                <select
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      paymentMethod: event.target.value,
                    }))
                  }
                  value={form.paymentMethod}
                >
                  {PAYMENT_METHOD_OPTIONS.filter(
                    (method) => method !== "All",
                  ).map((method) => (
                    <option key={method}>{method}</option>
                  ))}
                </select>
              </div>

              <textarea
                className="glass-input w-full resize-none rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                placeholder="Notes (optional)"
                rows={2}
                value={form.notes}
              />

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                  <input
                    checked={form.isRecurring}
                    className="rounded"
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        isRecurring: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Mark as recurring
                </label>

                <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-primary">
                  <input
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(event) =>
                      setReceiptFile(event.target.files?.[0] || null)
                    }
                    type="file"
                  />
                  <span className="glass-button cursor-pointer rounded-lg px-3 py-1.5 text-xs">
                    {receiptFile ? `Attached: ${receiptFile.name}` : "Attach Receipt"}
                  </span>
                </label>
              </div>

              <button
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                disabled={saving}
                onClick={handleSave}
                type="button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Expense"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
