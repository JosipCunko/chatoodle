"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Send, Paperclip } from "lucide-react";
import { useGlobalContext } from "./GlobalContextProvider";
import { sendGroupMessageAction, sendMessageAction } from "@/app/_lib/actions";
import {
  getGroupMessages,
  getMessagesBetweenUsers,
  subscribeToGroupMessages,
  subscribeToMessages,
} from "@/app/_lib/data-service";
import { errorToast } from "@/app/_lib/utils";
import Messages from "./Messages";
import Spinner from "./Spinner";
import { Tooltip } from "react-tooltip";
import { supabase } from "@/app/_lib/supabase";
import ChatInfo from "./ChatInfo";

export default function ChatArea({ currentUserId, currentUser }) {
  const {
    selectedContact,
    selectedGroup,
    setSelectedGroup,
    chatBackground,
    customBackground,
  } = useGlobalContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function loadMessages() {
      try {
        if (selectedContact && !selectedGroup) {
          const msgs = await getMessagesBetweenUsers(
            currentUserId,
            selectedContact.userId
          );
          setMessages(msgs);
        } else if (selectedGroup && !selectedContact) {
          const msgs = await getGroupMessages(selectedGroup.groupId);
          setMessages(msgs);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        errorToast("Failed to load messages");
      }
    }

    loadMessages();

    // Subscribe to real-time updates
    let subscription;

    async function setupSubscription() {
      if (selectedContact) {
        subscription = subscribeToMessages((payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.messageId === payload.new.messageId ? payload.new : msg
              )
            );
          }
        });
      } else if (selectedGroup) {
        subscription = await subscribeToGroupMessages(
          selectedGroup.groupId,
          (payload) => {
            if (payload.eventType === "INSERT") {
              setMessages((prev) => [...prev, payload.new]);
            } else if (payload.eventType === "UPDATE") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.messageId === payload.new.messageId ? payload.new : msg
                )
              );
            }
          }
        );
      }
    }

    setupSubscription();

    // Cleanup subscription when component unmounts or chat changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentUserId, selectedContact, selectedGroup]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const formData = new FormData();

      if (selectedContact) {
        formData.append("fromId", currentUserId);
        formData.append("toId", selectedContact.userId);
        formData.append("content", newMessage);
        await sendMessageAction(formData);
      } else if (selectedGroup) {
        formData.append("fromId", currentUserId);
        formData.append("groupId", selectedGroup.groupId);
        formData.append("content", newMessage);
        await sendGroupMessageAction(formData);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      errorToast(error.message);
      setNewMessage(newMessage);
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!file.type.startsWith("image/")) {
        errorToast("Please select an image file");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        errorToast("Image must be less than 5MB");
        return;
      }

      const fileName = `${Date.now()}-${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chatimgs")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("chatimgs")
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Send message
      const formData = new FormData();
      if (selectedContact && !selectedGroup) {
        formData.append("toId", selectedContact.userId);
      } else if (!selectedContact && selectedGroup) {
        formData.append("toId", selectedGroup.groupId);
        formData.append("groupId", selectedGroup.groupId);
      }
      formData.append("fromId", currentUserId);
      formData.append("mediaUrl", urlData.publicUrl);

      let response;
      if (selectedContact && !selectedGroup)
        response = await sendMessageAction(formData);
      else if (!selectedContact && selectedGroup) {
        response = await sendGroupMessageAction(formData);
      }

      if (response.error) {
        errorToast(response.error);
        // Delete uploaded file if message send fails
        await supabase.storage.from("chatimgs").remove([fileName]);
      }
    } catch (error) {
      console.error("File handling error:", error);
      errorToast(error.message || "Failed to upload image");
    }

    // Clear the input
    e.target.value = "";
  };

  if (!selectedContact && !selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-text-secondary">
          Select a friend or a group to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<Spinner />}>
          <Messages
            currentUserId={currentUserId}
            selectedContact={selectedContact}
            selectedGroup={selectedGroup}
            messages={messages}
            customBackground={customBackground}
            chatBackground={chatBackground}
            messagesEndRef={messagesEndRef}
          />
        </Suspense>

        <div className="p-4 border-t border-border bg-background">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-text-primary"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              data-tooltip-id="attach-tooltip"
              data-tooltip-content="Attach image"
            >
              <Paperclip className="w-5 h-5 text-text-secondary" />
            </button>
            <button
              type="submit"
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition duration-150 ease-in-out"
            >
              <Send className="w-5 h-5" />
            </button>
            <Tooltip
              id="attach-tooltip"
              place="top"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
          </form>
        </div>
      </div>

      {/* Add UserInfo component */}
      {selectedContact || selectedGroup ? (
        <Suspense fallback={<Spinner />}>
          <ChatInfo
            selectedContact={selectedContact}
            selectedGroup={selectedGroup}
            messages={messages}
            currentUser={currentUser}
            currentUserId={currentUserId}
            setSelectedGroup={setSelectedGroup}
          />
        </Suspense>
      ) : (
        ""
      )}
    </div>
  );
}
