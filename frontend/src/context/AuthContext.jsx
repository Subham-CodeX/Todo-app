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

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ==============================
  // LOAD CURRENT USER
  // ==============================

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

  // ==============================
  // LOGIN
  // ==============================

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

  // ==============================
  // REGISTER
  // ==============================

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

      localStorage.setItem(
        "taskflowToken",
        response.data.token
      );

      setUser(
        response.data.user
      );

      return response.data;
    };

  // ==============================
  // LOGOUT
  // ==============================

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