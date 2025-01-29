"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Send, Paperclip } from "lucide-react";
import { useGlobalContext } from "./GlobalContextProvider";
import { sendMessageAction } from "@/app/_lib/actions";
import {
  getMessagesBetweenUsers,
  subscribeToMessages,
} from "@/app/_lib/data-service";
import { errorToast } from "@/app/_lib/utils";
import Messages from "./Messages";
import Spinner from "./Spinner";
import { Tooltip } from "react-tooltip";
import { supabase } from "@/app/_lib/supabase";

export default function ChatArea({ currentUserId }) {
  const { selectedContact, chatBackground, customBackground } =
    useGlobalContext();
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
    let subscription;

    async function loadMessages() {
      if (!currentUserId || !selectedContact) return;

      try {
        // Load initial messages
        const initialMessages = await getMessagesBetweenUsers(
          currentUserId,
          selectedContact.userId
        );
        setMessages(initialMessages);

        // Subscribe to new messages
        subscription = subscribeToMessages((payload) => {
          const newMessage = payload.new;

          // Add message if it's part of the current conversation
          if (
            (newMessage.sent_from_id === currentUserId &&
              newMessage.sent_to_id === selectedContact.userId) ||
            (newMessage.sent_from_id === selectedContact.userId &&
              newMessage.sent_to_id === currentUserId)
          ) {
            setMessages((prev) => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(
                (msg) => msg.messageId === newMessage.messageId
              );
              if (messageExists) return prev;
              return [...prev, newMessage];
            });
          }
        });
      } catch (error) {
        console.error("Failed to load messages:", error);
        errorToast("Failed to load messages");
      }
    }

    loadMessages();

    // Cleanup subscription when component unmounts or chat changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentUserId, selectedContact]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const formData = new FormData();
    formData.append("fromId", currentUserId);
    formData.append("toId", selectedContact.userId);
    formData.append("content", newMessage);

    // Clear input immediately for better UX
    setNewMessage("");

    const response = await sendMessageAction(formData);

    if (response.error) {
      errorToast(response.error);
      // Restore the message if sending failed
      setNewMessage(newMessage);
      return;
    }

    // No need for optimistic update since we're using real-time subscription
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();

      if (bucketsError) throw bucketsError;
      console.log(supabase.storage);

      const bucketExists = buckets.some((bucket) => bucket.name === "chatimgs");
      if (!bucketExists) {
        errorToast(
          "Storage bucket not configured. Please contact administrator."
        );
        return;
      }

      if (!file.type.startsWith("image/")) {
        errorToast("Please select an image file");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        errorToast("Image must be less than 5MB");
        return;
      }

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("chatimgs")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("chatimgs").getPublicUrl(fileName);

      // Send message with media_url
      const formData = new FormData();
      formData.append("fromId", currentUserId);
      formData.append("toId", selectedContact.userId);
      formData.append("mediaUrl", publicUrl);

      const response = await sendMessageAction(formData);

      if (response.error) {
        errorToast(response.error);
        // Delete uploaded file if message send fails
        await supabase.storage.from("chatimgs").remove([fileName]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      errorToast("Failed to upload image");
    }

    // Clear the input
    e.target.value = "";
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-text-secondary">Select a friend to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Suspense fallback={<Spinner />}>
        <Messages
          currentUserId={currentUserId}
          selectedContact={selectedContact}
          messages={messages}
          customBackground={customBackground}
          chatBackground={chatBackground}
          messagesEndRef={messagesEndRef}
        />
      </Suspense>

      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
  );
}
