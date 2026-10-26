import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  fetchMe,
  getStoredToken,
  getStoredUser,
  loginRequest,
  persistSession,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [booting, setBooting] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!getStoredToken()) {
        setBooting(false);
        return;
      }

      try {
        const data = await fetchMe();
        if (cancelled) return;
        setUser(data.user);
        persistSession({ token: getStoredToken(), user: data.user });
      } catch {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password });
    persistSession(data);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'ADMIN',
      isStaff: user?.role === 'ADMIN' || user?.role === 'MECHANIC',
      isCustomer: user?.role === 'CUSTOMER',
      displayName: user ? `${user.firstName} ${user.lastName}` : '',
      login,
      logout,
    }),
    [user, token, booting, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
