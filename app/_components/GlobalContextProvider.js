"use client";

import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext({});

export default function GlobalContextProvider({ children }) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [chatBackground, setChatBackground] = useState("bg-background/100");
  const [customBackground, setCustomBackground] = useState(null);

  // Load saved background preferences
  useEffect(() => {
    const savedBackground = localStorage.getItem("chatBackground");
    const savedCustomBg = JSON.parse(localStorage.getItem("customBackground"));

    if (savedBackground) {
      setChatBackground(savedBackground);
    }
    if (savedCustomBg) {
      setCustomBackground(savedCustomBg);
    }
  }, []);

  const updateChatBackground = (newBackground) => {
    setChatBackground(newBackground);
    localStorage.setItem("chatBackground", newBackground);
  };
  const updateCustomBackground = (imageUrl) => {
    setCustomBackground(imageUrl);
    localStorage.setItem("customBackground", imageUrl);
    setChatBackground("bg-custom");
    localStorage.setItem("chatBackground", "bg-custom");
  };

  useEffect(() => {
    // Check local storage and system preference on mount
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const newDarkMode = !prev;
      document.documentElement.classList.toggle("dark", newDarkMode);
      localStorage.setItem("darkMode", newDarkMode);
      return newDarkMode;
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        selectedContact,
        setSelectedContact,
        showUserForm,
        setShowUserForm,
        darkMode,
        toggleDarkMode,
        chatBackground,
        updateChatBackground,
        customBackground,
        updateCustomBackground,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
}
