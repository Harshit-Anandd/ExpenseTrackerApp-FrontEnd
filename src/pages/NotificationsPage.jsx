import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getErrorMessage } from "@/lib/api-error";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/services/notificationService";

const severityStyles = {
  INFO: "bg-info/10 text-info",
  WARNING: "bg-warning/10 text-warning",
  CRITICAL: "bg-critical/10 text-critical",
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setError("");
      const data = await getNotifications();
      setNotifications(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? updated : n)),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to mark as read"));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to mark all as read"));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete notification"));
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">{unread} unread</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 glass-card text-primary rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
        >
          Mark all read
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading notifications...
        </p>
      )}

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div
            key={n.notificationId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card-solid p-4 ${!n.isRead ? "border-l-4 border-l-primary" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityStyles[n.severity] || severityStyles.INFO}`}
                  >
                    {n.severity}
                  </span>
                  <h3 className="text-sm font-semibold text-primary">
                    {n.title}
                  </h3>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-1 ml-3">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.notificationId)}
                    className="text-xs px-2 py-1 rounded glass-button text-primary hover:bg-white/20"
                  >
                    Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.notificationId)}
                  className="text-xs px-2 py-1 rounded hover:bg-destructive/10 text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && notifications.length === 0 && !error && (
        <div className="glass-card-solid p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No notifications yet. You&apos;re all caught up!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
