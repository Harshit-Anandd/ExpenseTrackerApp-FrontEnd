import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import apiClient from "@/lib/api-client";
import { getNotifications } from "@/lib/services/notificationService";

const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("INFO");
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const loadAuditLogs = async () => {
    try {
      const notifications = await getNotifications();
      setAuditLogs(notifications);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Failed to load audit logs"));
    }
  };

  useEffect(() => {
    void loadAuditLogs();
  }, []);

  const handleSend = async () => {
    if (!title || !message) return;

    try {
      setError("");
      await apiClient.post("/admin/notifications/broadcast", {
        title,
        message,
        severity,
      });

      setSent(true);
      setTitle("");
      setMessage("");
      await loadAuditLogs();
      setTimeout(() => setSent(false), 2000);
    } catch (sendError) {
      setError(getErrorMessage(sendError, "Failed to send broadcast"));
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-primary">
        Broadcasts & Audit
      </h1>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="glass-card-solid p-6">
        <h3 className="text-base font-display font-semibold text-primary mb-4">
          Send Broadcast Notification
        </h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message body"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg glass-input text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button
            onClick={handleSend}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
          >
            {sent ? "\u2713 Sent!" : "Send to All Users"}
          </button>
        </div>
      </div>
      <div className="glass-card-solid p-6">
        <h3 className="text-base font-display font-semibold text-primary mb-4">
          Audit Logs
        </h3>
        <div className="space-y-2">
          {auditLogs.map((log, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-white/10"
            >
              <div>
                <p className="text-sm text-primary">{log.title}</p>
                <p className="text-xs text-muted-foreground">{log.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">{log.createdAt?.replace("T", " ").slice(0, 16)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
var AdminNotifications_default = AdminNotifications;
export { AdminNotifications_default as default };
