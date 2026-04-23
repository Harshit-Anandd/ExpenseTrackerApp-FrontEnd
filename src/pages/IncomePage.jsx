import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/api-error";
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome as deleteIncomeApi,
  resolveIncomeApiSource,
} from "@/lib/services/incomeService";
import { useCategories } from "@/contexts/CategoryContext";
import { useAuth } from "@/contexts/AuthContext";

const todayIso = () => new Date().toISOString().slice(0, 10);

const INITIAL_FORM = {
  title: "",
  amount: "",
  categoryId: "",
  date: todayIso(),
  notes: "",
  isRecurring: false,
};

/**
 * Income management page — wired to income-service API.
 */
const IncomePage = () => {
  const { user } = useAuth();
  const { incomeCategories, getCategoryName } = useCategories();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const loadIncomes = async () => {
    try {
      setError("");
      const data = await getIncomes();
      setIncomes(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load income"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      if (
        search &&
        !income.title.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (categoryFilter !== "All") {
        const label = getCategoryName(income.categoryId);
        if (label !== categoryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [incomes, search, categoryFilter, getCategoryName]);

  const total = useMemo(() => {
    return filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  }, [filteredIncomes]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const openCreateForm = () => {
    resetForm();
    setForm((prev) => ({
      ...INITIAL_FORM,
      date: todayIso(),
      categoryId: incomeCategories[0]
        ? String(incomeCategories[0].categoryId)
        : "",
    }));
    setShowForm(true);
  };

  const openEditForm = (income) => {
    setEditingId(income.incomeId);
    setForm({
      title: income.title,
      amount: String(income.amount),
      categoryId: income.categoryId ? String(income.categoryId) : "",
      date: typeof income.date === "string" ? income.date.slice(0, 10) : todayIso(),
      notes: income.notes || "",
      isRecurring: income.isRecurring || false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.title?.trim() || !form.amount || !form.date || !form.categoryId) {
      setError("Title, amount, category, and date are required");
      return;
    }

    const amountTrim = String(form.amount).trim().replace(",", ".");
    const amountValue = Number.parseFloat(amountTrim);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Amount must be a valid positive number");
      return;
    }

    const category = incomeCategories.find(
      (c) => String(c.categoryId) === String(form.categoryId),
    );
    const apiSource = resolveIncomeApiSource(category?.name);

    const payload = {
      title: form.title.trim(),
      amount: amountValue,
      categoryId: Number(form.categoryId),
      source: apiSource,
      currency: user?.currency || "USD",
      date: form.date,
      notes: form.notes?.trim() || null,
      isRecurring: form.isRecurring,
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateIncome(editingId, payload);
        setIncomes((prev) =>
          prev.map((i) => (i.incomeId === editingId ? updated : i)),
        );
      } else {
        const created = await createIncome(payload);
        setIncomes((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to save income"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncomeApi(id);
      setIncomes((prev) => prev.filter((i) => i.incomeId !== id));
    } catch (delError) {
      setError(getErrorMessage(delError, "Failed to delete income"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">
            Income
          </h1>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(total)} · {filteredIncomes.length} entries
          </p>
        </div>

        <button
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          onClick={openCreateForm}
          type="button"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Income
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card-solid flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="glass-input w-full rounded-lg py-2 pl-9 pr-4 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search income..."
            value={search}
          />
        </div>

        <select
          className="glass-input rounded-lg px-3 py-2 text-sm text-primary focus:outline-none"
          onChange={(event) => setCategoryFilter(event.target.value)}
          value={categoryFilter}
        >
          <option>All</option>
          {incomeCategories.map((c) => (
            <option key={c.categoryId}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading income...
        </p>
      )}

      {/* Income Table */}
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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredIncomes.map((income, index) => (
                <motion.tr
                  animate={{ opacity: 1 }}
                  className="border-b border-border/10 transition-colors hover:bg-white/10"
                  initial={{ opacity: 0 }}
                  key={income.incomeId}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-primary">
                    {income.title}
                    {income.isRecurring && (
                      <span className="ml-1 text-xs">🔄</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="glass-button rounded-full px-2 py-1 text-xs text-primary">
                      {getCategoryName(income.categoryId)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(income.date)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-success">
                    +{formatCurrency(income.amount)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded-lg p-1.5 text-primary transition-colors hover:bg-white/20"
                      onClick={() => openEditForm(income)}
                      type="button"
                    >
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>

                    <button
                      className="ml-1 rounded-lg p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                      onClick={() => handleDelete(income.incomeId)}
                      type="button"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredIncomes.length === 0 && !error && (
        <div className="glass-card-solid p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No income entries found. Add your first income to start tracking.
          </p>
        </div>
      )}

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
                {editingId ? "Edit" : "Add"} Income
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
                <option value="">Select income category</option>
                {incomeCategories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>

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

              <button
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                onClick={handleSave}
                disabled={saving}
                type="button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Income"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default IncomePage;
