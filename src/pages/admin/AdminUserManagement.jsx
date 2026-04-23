import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getErrorMessage } from "@/lib/api-error";
import { getUsers, updateUserRole, updateUserStatus, updateUserSubscription } from "@/lib/services/adminUserService";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers(search ? { query: search } : {});
      setUsers(data);
      setError("");
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load users"));
    }
  }, [search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const toggleSuspend = async (user) => {
    try {
      const updated = await updateUserStatus(user.userId, !user.isActive);
      setUsers((previous) =>
        previous.map((candidate) =>
          candidate.userId === user.userId ? updated : candidate,
        ),
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update user status"));
    }
  };

  const toggleRole = async (user) => {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      const updated = await updateUserRole(user.userId, nextRole);
      setUsers((previous) =>
        previous.map((candidate) =>
          candidate.userId === user.userId ? updated : candidate,
        ),
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update user role"));
    }
  };

  const toggleSubscription = async (user) => {
    const nextSubscription = user.subscriptionType === "PAID" ? "NORMAL" : "PAID";
    try {
      const updated = await updateUserSubscription(user.userId, nextSubscription);
      setUsers((previous) =>
        previous.map((candidate) =>
          candidate.userId === user.userId ? updated : candidate,
        ),
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update subscription"));
    }
  };

  const statusStyles = {
    active: "bg-success/10 text-success",
    suspended: "bg-warning/10 text-warning",
    deactivated: "bg-muted text-muted-foreground",
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        User Management
      </h1>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="glass-card-solid p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Joined
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const userStatus = u.isActive ? "active" : "suspended";
                return (
                  <motion.tr
                    key={u.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/10 hover:bg-white/10"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-primary">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[userStatus]}`}
                      >
                        {userStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {u.createdAt?.split("T")[0] || "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => toggleSuspend(u)}
                        className="text-xs px-3 py-1.5 rounded-lg glass-button text-primary hover:bg-white/20"
                      >
                        {u.isActive ? "Suspend" : "Reactivate"}
                      </button>
                      <button
                        onClick={() => toggleRole(u)}
                        className="text-xs px-3 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                      >
                        {u.role === "ADMIN" ? "Set User" : "Set Admin"}
                      </button>
                      <button
                        onClick={() => toggleSubscription(u)}
                        className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 text-primary"
                      >
                        {u.subscriptionType === "PAID" ? "Set Normal" : "Set Paid"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
var AdminUserManagement_default = AdminUserManagement;
export { AdminUserManagement_default as default };
