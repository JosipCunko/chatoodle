import { useEffect, useState } from "react";
import { supabase } from "@/app/_lib/supabase";

const StatusIndicator = ({ userId, size = "md" }) => {
  const [status, setStatus] = useState("offline");

  useEffect(() => {
    // Subscribe to status changes
    const channel = supabase
      .channel(`user-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Users",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    // Get initial status
    supabase
      .from("Users")
      .select("status")
      .eq("userId", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setStatus(data.status);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-6 h-6",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
  };

  return (
    <>
      <div
        className={`rounded-full ${sizeClasses[size]} ${statusColors[status]}  absolute bottom-0 right-0 border-border border `}
      ></div>
    </>
  );
};

export default StatusIndicator;
