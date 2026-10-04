import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    return loadFromStorage('auth_user', null);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      saveToStorage('auth_user', currentUser);
    } else {
      removeFromStorage('auth_user');
    }
  }, [currentUser]);

  /**
   * Login user with email/username and password.
   * If backend authentication endpoint is available in the future,
   * call axios.post('/api/auth/login', { emailOrUsername, password }) here.
   */
  const login = async (emailOrUsername, password) => {
    setLoading(true);
    try {
      // Simulate brief network delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      const users = loadFromStorage('auth_users_db', []);
      const normalizedIdentifier = emailOrUsername.trim().toLowerCase();

      // Check if user exists in local database
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === normalizedIdentifier ||
          (u.username && u.username.toLowerCase() === normalizedIdentifier)
      );

      if (matched) {
        if (matched.password !== password) {
          throw new Error('Invalid credentials. Please verify your password.');
        }
        const userObj = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          username: matched.username || matched.email.split('@')[0],
        };
        setCurrentUser(userObj);
        return userObj;
      }

      // Default demo login flow if no user in local DB yet
      const fallbackUser = {
        id: 'usr_' + Date.now(),
        name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
        username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
      };

      // Register into local users store
      const updatedUsers = [...users, { ...fallbackUser, password }];
      saveToStorage('auth_users_db', updatedUsers);

      setCurrentUser(fallbackUser);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user account.
   * If backend authentication endpoint is available in the future,
   * call axios.post('/api/auth/signup', { name, email, password }) here.
   */
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const users = loadFromStorage('auth_users_db', []);
      const normalizedEmail = email.trim().toLowerCase();

      const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        throw new Error('An account with this email already exists. Please log in.');
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        username: normalizedEmail.split('@')[0],
      };

      const updatedUsers = [...users, { ...newUser, password }];
      saveToStorage('auth_users_db', updatedUsers);

      setCurrentUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out current user session.
   */
  const logout = () => {
    setCurrentUser(null);
    removeFromStorage('auth_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading, isAuthenticated: Boolean(currentUser) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
