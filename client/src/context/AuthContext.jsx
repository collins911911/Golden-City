import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Read the user id from the JWT, so people who logged in before the
// server started returning `id` still get one (no forced re-login).
const idFromToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(payload))?.id || null;
  } catch {
    return null;
  }
};

const withId = (data) => {
  if (!data) return data;
  if (data.id) return { ...data, id: String(data.id) };
  const id = data.token ? idFromToken(data.token) : null;
  return id ? { ...data, id } : data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gc_user');
      return stored ? withId(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    const full = withId(userData);
    localStorage.setItem('gc_user', JSON.stringify(full));
    setUser(full);
  };

  const logout = () => {
    localStorage.removeItem('gc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
