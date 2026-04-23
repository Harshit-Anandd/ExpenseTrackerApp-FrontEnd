import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import { getErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/formatters";

const TYPE_FILTER_OPTIONS = ["ALL", "EXPENSE", "INCOME"];
const FREE_TIER_CUSTOM_LIMIT = 5;

const INITIAL_FORM = {
  name: "",
  type: "EXPENSE",
  colorCode: "#0891B2",
  icon: "📁",
  budgetLimit: "",
};

/**
 * Category management page for expense/income tagging.
 * Wired to category-service via CategoryContext.
 */
const CategoriesPage = () => {
  const { user } = useAuth();
  const {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory: deleteCategoryAction,
    seedDefaults,
  } = useCategories();

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const isPaidUser = user?.subscriptionType === "PAID";

  const customExpenseCount = useMemo(
    () => categories.filter((category) => !category.isDefault && category.type === "EXPENSE").length,
    [categories],
  );

  const customIncomeCount = useMemo(
    () => categories.filter((category) => !category.isDefault && category.type === "INCOME").length,
    [categories],
  );

  const getLimitReachedForType = (type) => {
    if (isPaidUser) {
      return false;
    }

    const count = type === "INCOME" ? customIncomeCount : customExpenseCount;
    return count >= FREE_TIER_CUSTOM_LIMIT;
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) => typeFilter === "ALL" || category.type === typeFilter,
    );
  }, [categories, typeFilter]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError("");
  };

  const openCreateForm = () => {
    if (getLimitReachedForType("EXPENSE") && getLimitReachedForType("INCOME")) {
      setFormError(
        `Free plan limit reached. You can create up to ${FREE_TIER_CUSTOM_LIMIT} custom categories per type. Upgrade to PAID for unlimited categories.`,
      );
      return;
    }

    resetForm();
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingId(category.categoryId);
    setForm({
      name: category.name,
      type: category.type,
      colorCode: category.colorCode || "#0891B2",
      icon: category.icon || "📁",
      budgetLimit: category.budgetLimit ? String(category.budgetLimit) : "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setFormError("");

    if (!editingId && getLimitReachedForType(form.type)) {
      setFormError(
        `Free plan allows up to ${FREE_TIER_CUSTOM_LIMIT} custom ${form.type.toLowerCase()} categories. Upgrade to PAID for unlimited categories.`,
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        type: form.type,
        icon: form.icon,
        colorCode: form.colorCode,
        budgetLimit: form.budgetLimit
          ? Number.parseFloat(form.budgetLimit)
          : null,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      resetForm();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategoryAction(id);
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      await seedDefaults();
    } catch (err) {
      console.error("Failed to seed defaults:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="animate-pulse text-sm font-medium text-muted-foreground">
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-primary">
          Categories
        </h1>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Plan: {isPaidUser ? "PAID" : "NORMAL"}
          </span>
          {categories.length === 0 && (
            <button
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-transparent px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10"
              onClick={handleSeedDefaults}
              type="button"
            >
              Seed Defaults
            </button>
          )}
          <button
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
            onClick={openCreateForm}
            disabled={!isPaidUser && getLimitReachedForType("EXPENSE") && getLimitReachedForType("INCOME")}
            type="button"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {!isPaidUser && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          <p className="font-medium">Normal plan: up to {FREE_TIER_CUSTOM_LIMIT} custom categories per type</p>
          <p>
            Expense: {customExpenseCount}/{FREE_TIER_CUSTOM_LIMIT} | Income: {customIncomeCount}/{FREE_TIER_CUSTOM_LIMIT}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {formError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2">
        {TYPE_FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              typeFilter === option
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTypeFilter(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.categoryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                style={{
                  backgroundColor: `${category.colorCode || "#0891B2"}20`,
                }}
              >
                {category.icon || "📁"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.type}
                  {category.budgetLimit
                    ? ` • Budget: ${formatCurrency(category.budgetLimit)}`
                    : ""}
                </p>
              </div>

              {!category.isDefault && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => openEditForm(category)}
                    type="button"
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDelete(category.categoryId)}
                    type="button"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {category.isDefault && (
              <span className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Default
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No categories found. Create one or seed defaults.
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card-solid w-full max-w-md rounded-xl p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-primary">
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={resetForm}
                type="button"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  className="glass-input w-full rounded-lg px-3 py-2 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Food, Salary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Type
                </label>
                <select
                  className="glass-input w-full rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  disabled={!editingId && !isPaidUser && getLimitReachedForType("EXPENSE") && getLimitReachedForType("INCOME")}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              {!editingId && !isPaidUser && getLimitReachedForType(form.type) && (
                <div className="rounded-md border border-primary/30 bg-primary/10 p-2 text-xs text-primary">
                  <div className="flex items-center gap-1">
                    <HiOutlinePlus className="h-4 w-4" />
                    Upgrade to PAID to add more {form.type.toLowerCase()} categories.
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">
                    Icon
                  </label>
                  <input
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.icon}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, icon: e.target.value }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">
                    Color
                  </label>
                  <input
                    type="color"
                    className="h-10 w-full cursor-pointer rounded-lg border border-border/40 bg-transparent"
                    value={form.colorCode}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        colorCode: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Budget Limit (optional)
                </label>
                <input
                  type="number"
                  className="glass-input w-full rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.budgetLimit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      budgetLimit: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <button
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                onClick={handleSave}
                disabled={saving || !form.name}
                type="button"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
