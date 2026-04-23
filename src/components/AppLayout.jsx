import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineCash,
  HiOutlineChartPie,
  HiOutlineCog,
  HiOutlineCollection,
  HiOutlineCreditCard,
  HiOutlineDocumentReport,
  HiOutlineHome,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineTag,
  HiOutlineUser,
} from "react-icons/hi";
import { useAuth } from "@/contexts/AuthContext";
import { getUnreadCount } from "@/lib/services/notificationService";

const userNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { to: "/expenses", label: "Expenses", icon: HiOutlineCreditCard },
  { to: "/income", label: "Income", icon: HiOutlineCash },
  { to: "/categories", label: "Categories", icon: HiOutlineTag },
  { to: "/budgets", label: "Budgets", icon: HiOutlineCollection },
  { to: "/recurring", label: "Recurring", icon: HiOutlineRefresh },
  { to: "/analytics", label: "Analytics", icon: HiOutlineChartPie },
  { to: "/notifications", label: "Notifications", icon: HiOutlineBell },
  { to: "/reports", label: "Reports", icon: HiOutlineDocumentReport },
];

const adminNavItems = [
  { to: "/admin", label: "Admin Dashboard", icon: HiOutlineShieldCheck },
  { to: "/admin/users", label: "User Management", icon: HiOutlineUser },
  {
    to: "/admin/transactions",
    label: "Transactions Audit",
    icon: HiOutlineCreditCard,
  },
  {
    to: "/admin/analytics",
    label: "Platform Analytics",
    icon: HiOutlineChartPie,
  },
  { to: "/admin/notifications", label: "Broadcasts", icon: HiOutlineBell },
];

const navLinkClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "glass-card-solid text-primary"
      : "text-muted-foreground hover:bg-white/10 hover:text-primary"
  }`;

/**
 * Renders a labeled nav section for sidebar links.
 */
const SidebarSection = ({ title, items, unreadCount, onNavigate }) => {
  return (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>

      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={navLinkClassName}
        >
          <item.icon className="h-5 w-5" />
          {item.label}

          {item.to === "/notifications" && unreadCount > 0 && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
};

/**
 * Shared sidebar content reused by desktop and mobile sidebar wrappers.
 */
const SidebarContent = ({ user, unreadCount, onNavigate, onLogout }) => {
  const isAdmin = user?.role === "ADMIN";
  const primaryItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/30 p-6">
        <h1 className="text-2xl font-bold font-display text-primary">
          SpendSmart
        </h1>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <SidebarSection
          title="Main"
          items={primaryItems}
          unreadCount={unreadCount}
          onNavigate={onNavigate}
        />

      </nav>

      <div className="border-t border-border/30 p-4">
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-primary"
        >
          <HiOutlineCog className="h-5 w-5" />
          Profile & Settings
        </NavLink>

        <button
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
          type="button"
        >
          <HiOutlineLogout className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

/**
 * Dashboard shell with responsive sidebar and a shared top bar.
 */
const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch {
        // Silently ignore — notification count is non-critical
        setUnreadCount(0);
      }
    };

    fetchUnread();

    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="glass-sidebar hidden w-64 flex-shrink-0 flex-col lg:flex">
        <SidebarContent
          user={user}
          unreadCount={unreadCount}
          onNavigate={closeSidebar}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeSidebar}
          />

          <aside className="glass-sidebar absolute inset-y-0 left-0 w-72 animate-slide-in-left">
            <SidebarContent
              user={user}
              unreadCount={unreadCount}
              onNavigate={closeSidebar}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="glass-topbar flex flex-shrink-0 items-center justify-between px-4 py-3 lg:px-6">
          <button
            className="rounded-lg p-2 text-primary hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <HiOutlineMenu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button
              className="relative rounded-lg p-2 text-primary transition-colors hover:bg-white/10"
              onClick={() => navigate("/notifications")}
              type="button"
            >
              <HiOutlineBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white/10"
              onClick={() => navigate("/profile")}
              type="button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                {user?.fullName?.charAt(0) || "U"}
              </div>

              <span className="hidden text-sm font-medium text-primary md:block">
                {user?.fullName}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export { AppLayout };
