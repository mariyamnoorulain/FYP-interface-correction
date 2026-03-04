// src/context/AuthContext.tsx

import React, { createContext, useState, ReactNode } from 'react';

// User ka type define kar rahe hain
type Role = 'student' | 'tutor' | 'admin' | null;

interface User {
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
}

// Context create kiya
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, role: Role) => {
    setUser({ name, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Easy hook taake kahin bhi use kar sakein
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ko AuthProvider ke andar use karna hai!');
  }
  return context;
}