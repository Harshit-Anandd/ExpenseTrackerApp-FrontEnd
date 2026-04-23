import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  deactivateAccount as deactivateAccountRequest,
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  resendOtp as resendOtpRequest,
  register as registerRequest,
  setTwoFactor as setTwoFactorRequest,
  updateCurrency as updateCurrencyRequest,
  updatePassword as updatePasswordRequest,
  updateProfile as updateProfileRequest,
  verifyOtp as verifyOtpRequest,
} from "@/lib/services/authService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  storeTokens,
} from "@/lib/token-storage";

const AuthContext = createContext(null);

/**
 * Provides app-wide auth state and auth actions.
 */
const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setAuthenticated = useCallback((user) => {
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        if (isMounted) {
          setState((previous) => ({ ...previous, isLoading: false }));
        }
        return;
      }

      try {
        const profile = await getProfile();
        if (isMounted) {
          setAuthenticated(profile);
        }
      } catch {
        clearTokens();
        if (isMounted) {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuthenticated]);

  const login = useCallback(
    async (email, password) => {
      const authResponse = await loginRequest({ email, password });

      if (authResponse?.requiresOtp) {
        return authResponse;
      }

      storeTokens(authResponse);

      const profile = await getProfile();
      setAuthenticated(profile);

      return { requiresOtp: false, user: profile };
    },
    [setAuthenticated],
  );

  const register = useCallback(
    async (data) => {
      const authResponse = await registerRequest(data);

      if (authResponse?.requiresOtp) {
        return authResponse;
      }

      storeTokens(authResponse);

      let profile = await getProfile();

      if (data.currency || data.timezone) {
        profile = await updateProfileRequest({
          currency: data.currency,
          timezone: data.timezone,
        });
      }

      setAuthenticated(profile);

      return { requiresOtp: false, user: profile };
    },
    [setAuthenticated],
  );

  const verifyOtp = useCallback(
    async (payload) => {
      const authResponse = await verifyOtpRequest(payload);
      storeTokens(authResponse);
      const profile = await getProfile();
      setAuthenticated(profile);
      return profile;
    },
    [setAuthenticated],
  );

  const completeOAuthLogin = useCallback(
    async (authResponse) => {
      storeTokens(authResponse);
      const profile = await getProfile();
      setAuthenticated(profile);
      return profile;
    },
    [setAuthenticated],
  );

  const resendOtp = useCallback(async (payload) => {
    return resendOtpRequest(payload);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      await logoutRequest(refreshToken ? { refreshToken } : undefined);
    } catch {
      // Best effort logout; local cleanup always runs.
    }

    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateProfile = useCallback(async (data) => {
    const profile = await updateProfileRequest(data);
    setState((previous) => ({ ...previous, user: profile }));
    return profile;
  }, []);

  const updatePassword = useCallback(async (payload) => {
    await updatePasswordRequest(payload);
  }, []);

  const updateCurrency = useCallback(async (currency) => {
    await updateCurrencyRequest(currency);
    const profile = await getProfile();
    setState((previous) => ({ ...previous, user: profile }));
    return profile;
  }, []);

  const deactivateAccount = useCallback(async () => {
    await deactivateAccountRequest();
    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const setTwoFactor = useCallback(
    async (enabled) => {
      await setTwoFactorRequest(enabled);
      const profile = await getProfile();
      setState((previous) => ({ ...previous, user: profile }));
      return profile;
    },
    [],
  );

  const value = {
    ...state,
    login,
    register,
    resendOtp,
    verifyOtp,
    completeOAuthLogin,
    logout,
    setTwoFactor,
    updateProfile,
    updatePassword,
    updateCurrency,
    deactivateAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Convenience hook for accessing authentication state/actions.
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export { AuthProvider, useAuth };
