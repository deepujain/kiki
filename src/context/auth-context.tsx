
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// This is a mock User type since we are not using Firebase Auth
// It has a similar shape to make it compatible with the rest of the app
type MockUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory user store
const DEMO_USER_USERNAME = "admin";
const DEMO_USER_PASS = "rockstar";
const MOCK_USER: MockUser = {
    uid: "mock-user-123",
    email: "admin@example.com",
    displayName: "Admin User",
    photoURL: "https://picsum.photos/seed/admin/100/100",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On initial load, check for stored session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('kiki-auth-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error reading stored auth:', error);
      localStorage.removeItem('kiki-auth-user');
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    if (username === DEMO_USER_USERNAME && password === DEMO_USER_PASS) {
      setUser(MOCK_USER);
      localStorage.setItem('kiki-auth-user', JSON.stringify(MOCK_USER));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('kiki-auth-user');
    router.push("/login");
  };

  const value = { user, loading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
