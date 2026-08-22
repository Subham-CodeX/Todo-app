import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/api";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================
  // LOAD USER AFTER APP START
  // =====================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "taskflowToken"
      );

    if (!token) {
      setLoading(false);
      return;
    }

    loadCurrentUser();
  }, []);

  // =====================================
  // LOAD CURRENT USER
  // =====================================

  const loadCurrentUser =
    async () => {
      try {
        const response =
          await API.get(
            "/auth/me"
          );

        setUser(
          response.data.user
        );

      } catch (error) {
        console.error(
          "Auth Error:",
          error
        );

        localStorage.removeItem(
          "taskflowToken"
        );

        setUser(null);

      } finally {
        setLoading(false);
      }
    };

  // =====================================
  // LOGIN
  // =====================================

  const login = async (
    email,
    password
  ) => {
    const response =
      await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    localStorage.setItem(
      "taskflowToken",
      response.data.token
    );

    setUser(
      response.data.user
    );

    return response.data;
  };

  // =====================================
  // REGISTER
  // =====================================

  const register =
    async (
      name,
      email,
      password
    ) => {
      const response =
        await API.post(
          "/auth/register",
          {
            name,
            email,
            password,
          }
        );

      return response.data;
    };

  // =====================================
  // REFRESH USER
  // =====================================

  const refreshUser =
    async () => {
      try {
        const response =
          await API.get(
            "/auth/me"
          );

        setUser(
          response.data.user
        );

        return response.data.user;

      } catch (error) {
        console.error(
          "Refresh User Error:",
          error
        );

        return null;
      }
    };

  // =====================================
  // LOGOUT
  // =====================================

  const logout = () => {
    localStorage.removeItem(
      "taskflowToken"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}