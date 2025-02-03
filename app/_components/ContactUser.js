import { Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getLastMessageForContact } from "../_lib/data-service";
import StatusIndicator from "./StatusIndicator";

function ContactUser({ name, status, avatar, currentUserId, contactUserId }) {
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    const loadLastMessage = async () => {
      const lastMessageResponse = await getLastMessageForContact(
        currentUserId,
        contactUserId
      );
      setLastMessage(lastMessageResponse);
    };
    loadLastMessage();
  }, [currentUserId, contactUserId]);

  const truncateMessage = (message) => {
    if (!message) return "No messages yet";
    return message.length > 30 ? message.substring(0, 27) + "..." : message;
  };

  const getMessagePrefix = () => {
    if (!lastMessage) return "";
    return lastMessage.sent_from_id === currentUserId ? "You: " : "";
  };

  return (
    <li className="px-4 py-3 cursor-pointer transition duration-300 ease-in-out">
      <div className="flex items-center">
        <div className="flex-shrink-0 relative h-8 w-8  ">
          {avatar ? (
            <>
              <Image
                src={avatar}
                alt={name}
                fill
                sizes="32px"
                className="rounded-full object-cover"
                priority
              />
              <StatusIndicator userId={contactUserId} />
            </>
          ) : (
            <Users className="h-8 w-8 rounded-full bg-primary p-1 text-surface" />
          )}
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <p className="text-xs text-text-secondary truncate">
            {getMessagePrefix()}
            {truncateMessage(lastMessage?.content)}
          </p>
        </div>
      </div>
    </li>
  );
}

export default ContactUser;
