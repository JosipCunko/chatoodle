"use client";

import { useEffect, useState } from "react";
import {
  setUserOnline,
  setUserAway,
  setUserOffline,
} from "@/app/_lib/data-service";

export default function StatusHandler() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth-status");
      const data = await res.json();
      setCurrentUserId(data.userId);
    }
    loadUser();
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Set initial status
    const initialize = async () => {
      await setUserOnline(currentUserId);
    };
    initialize();

    // Handle tab visibility changes
    const handleVisibility = async () => {
      if (document.hidden) {
        await setUserAway(currentUserId);
      } else {
        await setUserOnline(currentUserId);
      }
    };

    // Handle page close
    const handleClose = async () => {
      await setUserOffline(currentUserId);
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleClose);

    // Cleanup
    return () => {
      const cleanup = async () => {
        await setUserOffline(currentUserId);
      };
      cleanup();

      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleClose);
    };
  }, [currentUserId]);

  return null;
}
