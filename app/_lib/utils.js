import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "react-hot-toast";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function successToast(message) {
  toast(message, {
    style: {
      border: "1px solid var(--primary)",
    },
    icon: "✅",
  });
}

export function errorToast(message) {
  toast(message, {
    style: {
      border: "1px solid #f43f5e",
    },
    icon: "❌",
  });
}

export function infoToast(message) {
  toast(message, {
    icon: "ℹ️",
  });
}

export const formatDayHeader = (date) => {
  const messageDate = new Date(date);
  if (isToday(messageDate)) return "Today";
  if (isYesterday(messageDate)) return "Yesterday";

  const daysDiff = differenceInDays(new Date(), messageDate);
  if (daysDiff < 7) return format(messageDate, "EEEE");

  return isThisYear(messageDate)
    ? format(messageDate, "EEEE, d. MMM")
    : format(messageDate, "EEEE, d. MMM yyyy");
};

export const groupMessagesByDay = (messages) => {
  const groups = {};
  messages.forEach((message) => {
    const date = new Date(message.created_at);
    const day = format(date, "yyyy-MM-dd");
    if (!groups[day]) groups[day] = [];
    groups[day].push(message);
  });
  return groups;
};

export const shouldCombineMessages = (currentMsg, prevMsg) => {
  if (!prevMsg) return false;
  if (currentMsg.sent_from_id !== prevMsg.sent_from_id) return false;

  const timeDiff = differenceInMinutes(
    new Date(currentMsg.created_at),
    new Date(prevMsg.created_at)
  );
  return timeDiff < 1;
};
export const formatMessageDate = (date) => {
  return format(new Date(date), "h:mm a");
};
