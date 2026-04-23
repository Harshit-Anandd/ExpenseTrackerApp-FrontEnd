let dashboardRoutePreloadPromise = null;

/**
 * Preloads the most-used authenticated route so post-login navigation feels instant.
 */
const preloadDashboardRoute = () => {
  if (!dashboardRoutePreloadPromise) {
    dashboardRoutePreloadPromise = import("../pages/DashboardPage");
  }

  return dashboardRoutePreloadPromise;
};

export { preloadDashboardRoute };
