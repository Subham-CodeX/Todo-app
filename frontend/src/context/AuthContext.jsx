import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/api";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {

  // =====================================
  // USER STATE
  // =====================================

  const [
    user,
    setUser,
  ] =
    useState(
      null
    );

  // =====================================
  // LOADING STATE
  // =====================================

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  // =====================================
  // LOAD USER AFTER APP START
  // =====================================

  useEffect(
    () => {

      const token =
        localStorage.getItem(
          "taskflowToken"
        );

      // ---------------------------------
      // NO TOKEN
      // ---------------------------------

      if (
        !token
      ) {

        setLoading(
          false
        );

        return;

      }

      // ---------------------------------
      // CONNECT SOCKET
      // ---------------------------------

      connectSocket(
        token
      );

      // ---------------------------------
      // LOAD CURRENT USER
      // ---------------------------------

      loadCurrentUser();

      // ---------------------------------
      // CLEANUP
      // ---------------------------------

      return () => {

        disconnectSocket();

      };

    },
    []
  );

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


      } catch (
        error
      ) {

        console.error(
          "Auth Error:",
          error
        );

        // Invalid token

        localStorage.removeItem(
          "taskflowToken"
        );


        disconnectSocket();


        setUser(
          null
        );


      } finally {

        setLoading(
          false
        );

      }

    };

  // =====================================
  // LOGIN
  // =====================================

  const login =
    async (
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

      // ---------------------------------
      // SAVE TOKEN
      // ---------------------------------

      const token =
        response.data.token;


      localStorage.setItem(
        "taskflowToken",
        token
      );

      // ---------------------------------
      // SAVE USER
      // ---------------------------------

      setUser(
        response.data.user
      );

      // ---------------------------------
      // CONNECT SOCKET
      // ---------------------------------

      connectSocket(
        token
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


      } catch (
        error
      ) {

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

  const logout =
    () => {

      // ---------------------------------
      // DISCONNECT SOCKET
      // ---------------------------------

      disconnectSocket();

      // ---------------------------------
      // REMOVE TOKEN
      // ---------------------------------

      localStorage.removeItem(
        "taskflowToken"
      );

      // ---------------------------------
      // REMOVE USER
      // ---------------------------------

      setUser(
        null
      );

    };

  // =====================================
  // CONTEXT PROVIDER
  // =====================================

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

      {
        children
      }

    </AuthContext.Provider>

  );

}

// =====================================
// USE AUTH HOOK
// =====================================

export function useAuth() {

  return useContext(
    AuthContext
  );

}