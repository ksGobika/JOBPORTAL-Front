"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { setUser } from "./slices/authSlice";
import { authService } from "../services/api";

function AuthHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUserStr = localStorage.getItem("user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.id) {
            dispatch(setUser(savedUser));

            // Silently verify & sync with MySQL database
            if (savedUser.email) {
              authService.login(savedUser.email)
                .then((res) => {
                  const dbUsers = res.data;
                  const freshUser = Array.isArray(dbUsers) ? dbUsers[0] : dbUsers;
                  if (freshUser && freshUser.id) {
                    dispatch(setUser(freshUser));
                    localStorage.setItem("user", JSON.stringify(freshUser));
                  }
                })
                .catch(() => {
                  // Keep local session if backend temporarily starting
                });
            }
          }
        }
      } catch (e) {
        console.error("Error restoring user session:", e);
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}