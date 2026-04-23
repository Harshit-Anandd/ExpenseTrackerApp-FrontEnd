import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="animate-pulse text-xl font-display text-primary">
      Loading...
    </div>
  </div>
);

/**
 * Blocks access when the user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isActive === false) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Blocks access for non-admin users.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isActive === false) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export { AdminRoute, ProtectedRoute };
