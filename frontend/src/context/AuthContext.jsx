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
  createContext(
    null
  );


export function AuthProvider({
  children,
}) {

  const [
    user,
    setUser,
  ] =
    useState(
      null
    );


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

      const loadUser =
        async () => {

          const token =
            localStorage.getItem(
              "taskflowToken"
            );


          // ===============================
          // NO TOKEN
          // ===============================

          if (
            !token
          ) {

            setLoading(
              false
            );

            return;

          }


          try {

            // =============================
            // VERIFY USER
            // =============================

            const response =
              await API.get(
                "/auth/me"
              );


            // =============================
            // SAVE USER
            // =============================

            setUser(
              response.data.user
            );


            // =============================
            // CONNECT SOCKET ONCE
            // =============================

            connectSocket(
              token
            );


          } catch (
            error
          ) {

            console.error(
              "Auth Error:",
              error
            );


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


      loadUser();


    },
    []
  );


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


      const token =
        response.data.token;


      localStorage.setItem(
        "taskflowToken",
        token
      );


      setUser(
        response.data.user
      );


      // CONNECT SOCKET

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

      disconnectSocket();


      localStorage.removeItem(
        "taskflowToken"
      );


      setUser(
        null
      );

    };


  // =====================================
  // CONTEXT
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
// USE AUTH
// =====================================

export function useAuth() {

  return useContext(
    AuthContext
  );

}