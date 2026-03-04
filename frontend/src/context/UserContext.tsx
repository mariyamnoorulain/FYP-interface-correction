import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserFromStorage, saveUserToStorage, clearUserFromStorage, normalizeUser, getUserId, getUserRole, type User } from '../utils/userHelper';
import type { Page } from '../types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  onNavigate?: (page: Page) => void;
}

export function UserProvider({ children, onNavigate }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = () => {
      try {
        const savedUser = getUserFromStorage();
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          try {
            const normalizedUser = normalizeUser(savedUser);
            setUser(normalizedUser);
          } catch (normalizeError) {
            console.error('Error normalizing user:', normalizeError);
            setUser(null);
            clearUserFromStorage();
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
        try {
          clearUserFromStorage();
        } catch (clearError) {
          console.error('Error clearing storage:', clearError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Auto-refresh token before expiry (check every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Only clear if user is actually logged out (no token at all)
        return;
      }

      // Try to refresh token (silently) - defined below
      // Don't clear user on refresh failure - token might still be valid
      try {
        await refreshToken();
        // Silently handle refresh - don't log errors
      } catch (error) {
        // Silently fail - token might still be valid
      }
    };

    // Don't check immediately on login - wait 1 minute first
    // Then check every 5 minutes
    let intervalId: NodeJS.Timeout | null = null;
    
    const initialTimeout = setTimeout(() => {
      checkAndRefreshToken();
      intervalId = setInterval(checkAndRefreshToken, 5 * 60 * 1000);
    }, 60 * 1000); // Wait 1 minute before first check

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = (userData: User, token: string) => {
    try {
      console.log('UserContext.login called with:', { userData, hasToken: !!token });
      const normalizedUser = normalizeUser({
        ...userData,
        token,
        isLoggedIn: true,
      });
      
      console.log('Normalized user:', normalizedUser);
      saveUserToStorage(normalizedUser);
      localStorage.setItem('token', token);
      setUser(normalizedUser);
      console.log('UserContext: User state updated, token saved');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    clearUserFromStorage();
    setUser(null);
    if (onNavigate) {
      onNavigate('landing');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = normalizeUser({ ...user, ...userData });
      saveUserToStorage(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token || data.accessToken;
        
        if (newToken) {
          localStorage.setItem('token', newToken);
          
          // Update user if new user data is provided
          if (data.user) {
            const normalizedUser = normalizeUser({
              ...user,
              ...data.user,
              token: newToken,
            });
            saveUserToStorage(normalizedUser);
            setUser(normalizedUser);
          }
          
          return true;
        }
      } else if (response.status === 401) {
        // Token expired or invalid, logout user
        logout();
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!getUserId(user),
    login,
    logout,
    updateUser,
    refreshToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

