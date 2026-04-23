import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { formatCurrency } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/api-error";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget as deleteBudgetApi,
} from "@/lib/services/budgetService";
import { useCategories } from "@/contexts/CategoryContext";
import { useAuth } from "@/contexts/AuthContext";

const todayIso = () => new Date().toISOString().slice(0, 10);

const INITIAL_FORM = {
  name: "",
  categoryId: "",
  budgetLimit: "",
  period: "MONTHLY",
  alertThreshold: "80",
  startDate: todayIso(),
  endDate: "",
};

/**
 * Budget management page — wired to budget-service API.
 */
const BudgetsPage = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const { categories } = useCategories();

  const expenseCategories = categories.filter(
    (c) => c.type === "EXPENSE" || c.type === "BOTH",
  );

  /* ---------- data loading ---------- */
  const loadBudgets = async () => {
    try {
      setError("");
      const data = await getBudgets();
      setBudgets(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load budgets"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  /* ---------- form helpers ---------- */
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (budget) => {
    setEditingId(budget.budgetId);
    setForm({
      name: budget.name || getCategoryName(budget.categoryId),
      categoryId: String(budget.categoryId || ""),
      budgetLimit: String(budget.budgetLimit),
      period: budget.period,
      alertThreshold: String(budget.alertThreshold ?? 80),
      startDate: budget.startDate || todayIso(),
      endDate: budget.endDate || "",
    });
    setShowForm(true);
  };

  /* ---------- save / delete ---------- */
  const handleSave = async () => {
    setError("");
    if (!form.categoryId || !form.budgetLimit || !form.startDate) {
      setError("Category, budget limit, and start date are required");
      return;
    }

    const limit = Number.parseFloat(String(form.budgetLimit).trim());
    if (!Number.isFinite(limit) || limit <= 0) {
      setError("Budget limit must be a positive number");
      return;
    }

    const alertParsed = Number.parseInt(String(form.alertThreshold).trim(), 10);
    const alertThreshold =
      Number.isFinite(alertParsed) && alertParsed >= 1 && alertParsed <= 100
        ? alertParsed
        : 80;

    const category = categories.find(
      (c) => c.categoryId === Number(form.categoryId),
    );
    const derivedName =
      (form.name && form.name.trim()) || category?.name || "Budget";

    const payload = {
      name: derivedName,
      categoryId: Number(form.categoryId),
      budgetLimit: limit,
      period: form.period,
      alertThreshold,
      startDate: form.startDate,
      endDate: form.endDate?.trim() ? form.endDate.trim() : null,
      currency: user?.currency || "USD",
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateBudget(editingId, payload);
        setBudgets((prev) =>
          prev.map((b) => (b.budgetId === editingId ? updated : b)),
        );
      } else {
        const created = await createBudget(payload);
        setBudgets((prev) => [...prev, created]);
      }
      resetForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to save budget"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudgetApi(id);
      setBudgets((prev) => prev.filter((b) => b.budgetId !== id));
    } catch (delError) {
      setError(getErrorMessage(delError, "Failed to delete budget"));
    }
  };

  /* ---------- helpers ---------- */
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.categoryId === catId);
    return cat?.name || `Category #${catId}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-primary">
          Budgets
        </h1>

        <button
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          onClick={openCreateForm}
          type="button"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Create Budget
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading budgets...
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {budgets.map((budget, index) => {
          const usagePercentage = budget.budgetLimit > 0
            ? Math.min(
                (budget.spentAmount / budget.budgetLimit) * 100,
                100,
              )
            : 0;
          const isAlert = usagePercentage >= budget.alertThreshold;
          const isExceeded = usagePercentage >= 100;

          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-solid p-6"
              initial={{ opacity: 0, y: 10 }}
              key={budget.budgetId}
              transition={{ delay: index * 0.05 }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-display font-semibold text-primary">
                    {getCategoryName(budget.categoryId)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {budget.period} · {budget.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    className="rounded-lg p-1.5 text-primary hover:bg-white/20"
                    onClick={() => openEditForm(budget)}
                    type="button"
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(budget.budgetId)}
                    type="button"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(budget.spentAmount)}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {formatCurrency(budget.budgetLimit)}
                </span>
              </div>

              <div className="mb-2 h-3 w-full rounded-full bg-white/30">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isExceeded
                      ? "bg-destructive"
                      : isAlert
                        ? "bg-warning"
                        : "bg-primary"
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {usagePercentage.toFixed(0)}% used
                </span>
                {isExceeded && (
                  <span className="text-xs font-semibold text-destructive">
                    Exceeded
                  </span>
                )}
                {isAlert && !isExceeded && (
                  <span className="text-xs font-semibold text-warning">
                    Alert threshold
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!loading && budgets.length === 0 && !error && (
        <div className="glass-card-solid p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No budgets yet. Create one to start tracking your spending limits.
          </p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={resetForm}
          />

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-solid relative z-10 w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.95 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-primary">
                {editingId ? "Edit" : "Create"} Budget
              </h2>
              <button onClick={resetForm} type="button">
                <HiOutlineX className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <select
                className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(e) => {
                  const categoryId = e.target.value;
                  const cat = expenseCategories.find(
                    (c) => String(c.categoryId) === categoryId,
                  );
                  setForm((prev) => ({
                    ...prev,
                    categoryId,
                    name: prev.name?.trim()
                      ? prev.name
                      : cat?.name || prev.name,
                  }));
                }}
                value={form.categoryId}
              >
                <option value="">Select category</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Budget name"
                type="text"
                value={form.name}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Start date
                  </label>
                  <input
                    className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    type="date"
                    value={form.startDate}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    End date (optional)
                  </label>
                  <input
                    className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    type="date"
                    value={form.endDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      budgetLimit: e.target.value,
                    }))
                  }
                  placeholder="Budget limit"
                  type="number"
                  value={form.budgetLimit}
                />

                <input
                  className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-muted-foreground focus:outline-none"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      alertThreshold: e.target.value,
                    }))
                  }
                  placeholder="Alert %"
                  type="number"
                  value={form.alertThreshold}
                />
              </div>

              <select
                className="glass-input w-full rounded-lg px-4 py-2.5 text-sm text-primary focus:outline-none"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    period: e.target.value,
                  }))
                }
                value={form.period}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="YEARLY">Yearly</option>
              </select>

              <button
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                onClick={handleSave}
                disabled={saving}
                type="button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save"
                    : "Create"}{" "}
                Budget
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
