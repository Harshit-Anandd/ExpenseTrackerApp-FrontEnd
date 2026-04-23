import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AdminRoute, ProtectedRoute } from "@/components/RouteGuards";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CategoryProvider } from "@/contexts/CategoryContext";

const queryClient = new QueryClient();

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const BudgetsPage = lazy(() => import("./pages/BudgetsPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage"));
const IncomePage = lazy(() => import("./pages/IncomePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const RecurringPage = lazy(() => import("./pages/RecurringPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const VerifyOtpPage = lazy(() => import("./pages/VerifyOtpPage"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"),);
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminUserManagement = lazy(() => import("./pages/admin/AdminUserManagement"),);

const PageFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="animate-pulse text-sm font-medium text-muted-foreground">
      Loading page...
    </div>
  </div>
);

/**
 * Wraps private user pages with auth guard + shared dashboard layout.
 */
const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

/**
 * Wraps admin pages with admin guard + shared dashboard layout.
 */
const AdminPage = ({ children }) => (
  <AdminRoute>
    <AppLayout>{children}</AppLayout>
  </AdminRoute>
);

const OAuthCallbackRoute = () => {
  const { completeOAuthLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [hasError, setHasError] = useState(false);
  const [targetRoute, setTargetRoute] = useState(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setHasError(true);
      return;
    }

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    if (!accessToken || !refreshToken) {
      setHasError(true);
      return;
    }

    completeOAuthLogin({ accessToken, refreshToken })
      .then((profile) => {
        setTargetRoute(profile?.role === "ADMIN" ? "/admin" : "/dashboard");
      })
      .catch(() => {
        setHasError(true);
      });
  }, [completeOAuthLogin, searchParams]);

  if (!hasError && !targetRoute) {
    return <PageFallback />;
  }

  if (hasError) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={targetRoute} replace />;
};

/**
 * Root app component.
 * Route sections are ordered as public, user-protected, admin-protected, then fallback.
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <AuthProvider>
          <CategoryProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route
                  path="/oauth/callback"
                  element={<OAuthCallbackRoute />}
                />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedPage>
                      <DashboardPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedPage>
                      <ExpensesPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/income"
                  element={
                    <ProtectedPage>
                      <IncomePage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedPage>
                      <CategoriesPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <ProtectedPage>
                      <BudgetsPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/recurring"
                  element={
                    <ProtectedPage>
                      <RecurringPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedPage>
                      <AnalyticsPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedPage>
                      <NotificationsPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedPage>
                      <ReportsPage />
                    </ProtectedPage>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedPage>
                      <ProfilePage />
                    </ProtectedPage>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminPage>
                      <AdminDashboard />
                    </AdminPage>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminPage>
                      <AdminUserManagement />
                    </AdminPage>
                  }
                />
                <Route
                  path="/admin/transactions"
                  element={
                    <AdminPage>
                      <AdminTransactions />
                    </AdminPage>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminPage>
                      <AdminAnalytics />
                    </AdminPage>
                  }
                />
                <Route
                  path="/admin/notifications"
                  element={
                    <AdminPage>
                      <AdminNotifications />
                    </AdminPage>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </CategoryProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;