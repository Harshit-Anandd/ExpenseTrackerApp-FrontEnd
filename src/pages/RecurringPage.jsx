import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatters";
import { getErrorMessage } from "@/lib/api-error";
import {
  getRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  toggleRecurringRule,
  deleteRecurringRule,
} from "@/lib/services/recurringService";
import { useCategories } from "@/contexts/CategoryContext";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlinePause,
  HiOutlinePlay,
} from "react-icons/hi";

const frequencies = ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

const frequencyLabel = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const INITIAL_FORM = {
  title: "",
  amount: "",
  type: "EXPENSE",
  categoryId: "",
  frequency: "MONTHLY",
  startDate: "",
  endDate: "",
  notes: "",
};

const RecurringPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const { categories } = useCategories();

  const loadRules = async () => {
    try {
      setError("");
      const data = await getRecurringRules();
      setRules(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load recurring rules"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.categoryId === catId);
    return cat?.name || "";
  };

  const openEdit = (r) => {
    setEditingId(r.ruleId);
    setForm({
      title: r.title,
      amount: String(r.amount),
      type: r.type,
      categoryId: String(r.categoryId || ""),
      frequency: r.frequency,
      startDate: r.startDate,
      endDate: r.endDate || "",
      notes: r.notes || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount) return;

    const payload = {
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || null,
      notes: form.notes || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateRecurringRule(editingId, payload);
        setRules((prev) =>
          prev.map((r) => (r.ruleId === editingId ? updated : r)),
        );
      } else {
        const created = await createRecurringRule(payload);
        setRules((prev) => [...prev, created]);
      }
      resetForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Failed to save rule"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleRecurringRule(id);
      setRules((prev) =>
        prev.map((r) => (r.ruleId === id ? updated : r)),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to toggle rule"));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurringRule(id);
      setRules((prev) => prev.filter((r) => r.ruleId !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete rule"));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-primary">
          Recurring Transactions
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading rules...
        </p>
      )}

      {/* Upcoming this month */}
      {rules.filter((r) => r.isActive && r.isDue).length > 0 && (
        <div className="glass-card-solid p-4 mb-4">
          <h3 className="text-sm font-semibold text-primary mb-2">
            Due Now
          </h3>
          <div className="flex flex-wrap gap-3">
            {rules
              .filter((r) => r.isActive && r.isDue)
              .map((r) => (
                <span
                  key={r.ruleId}
                  className="text-xs px-3 py-1.5 rounded-full glass-button text-primary"
                >
                  {r.title} · {formatCurrency(r.amount)} · {r.nextDueDate}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Upcoming active rules */}
      {rules.filter((r) => r.isActive && !r.isDue).length > 0 && (
        <div className="glass-card-solid p-4 mb-4">
          <h3 className="text-sm font-semibold text-primary mb-2">
            Upcoming
          </h3>
          <div className="flex flex-wrap gap-3">
            {rules
              .filter((r) => r.isActive && !r.isDue)
              .map((r) => (
                <span
                  key={r.ruleId}
                  className="text-xs px-3 py-1.5 rounded-full glass-button text-primary"
                >
                  {r.title} · {formatCurrency(r.amount)} · {r.nextDueDate}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.map((r, i) => (
          <motion.div
            key={r.ruleId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card-solid p-5 flex items-center justify-between ${!r.isActive ? "opacity-50" : ""}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-primary">{r.title}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${r.type === "EXPENSE" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}
                >
                  {r.type}
                </span>
                {!r.isActive && (
                  <span className="text-xs text-muted-foreground">
                    Inactive
                  </span>
                )}
                {r.isDue && r.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                    Due
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {frequencyLabel[r.frequency] || r.frequency} · {getCategoryName(r.categoryId) || "Uncategorized"} · Next: {r.nextDueDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold ${r.type === "EXPENSE" ? "text-destructive" : "text-success"}`}
              >
                {r.type === "EXPENSE" ? "-" : "+"}
                {formatCurrency(r.amount)}
              </span>
              <button
                onClick={() => handleToggle(r.ruleId)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-primary"
                title={r.isActive ? "Pause" : "Resume"}
              >
                {r.isActive ? (
                  <HiOutlinePause className="w-4 h-4" />
                ) : (
                  <HiOutlinePlay className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openEdit(r)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-primary"
              >
                <HiOutlinePencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(r.ruleId)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && rules.length === 0 && !error && (
        <div className="glass-card-solid p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No recurring rules yet. Set up automatic expense or income tracking.
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card-solid w-full max-w-lg p-6 z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-primary">
                {editingId ? "Edit" : "Add"} Recurring Rule
              </h2>
              <button onClick={resetForm}>
                <HiOutlineX className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title"
                className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="Amount"
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm placeholder:text-muted-foreground focus:outline-none"
                />
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories
                    .filter(
                      (c) =>
                        c.type === form.type || c.type === "BOTH",
                    )
                    .map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, frequency: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none"
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>
                      {frequencyLabel[f]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none"
                  placeholder="End date (optional)"
                />
              </div>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Notes (optional)"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Changes take effect from the next due date only.
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Save" : "Create"} Rule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecurringPage;
