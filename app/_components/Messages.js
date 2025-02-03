"use client";
import { useState } from "react";
import {
  formatDayHeader,
  groupMessagesByDay,
  shouldCombineMessages,
  formatMessageDate,
} from "../_lib/utils";
import { updateMessageEmojiAction } from "@/app/_lib/actions";
import Image from "next/image";
import { User } from "lucide-react";

const EMOJI_LIST = ["👍", "😀", "😭", "❌", "🤡"];

function Messages({
  selectedContact,
  selectedGroup,
  messages,
  currentUserId,
  customBackground,
  chatBackground,
  messagesEndRef,
}) {
  //Set to onClick
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  async function handleSubmitEmoji(emoji, messageId) {
    const formData = new FormData();
    formData.append("messageId", messageId);
    formData.append("emoji", emoji);

    const response = await updateMessageEmojiAction(formData);

    if (response.error) {
      console.error("Failed to update emoji:", response.error);
    }
  }

  // Return null if neither contact nor group is selected
  if (!selectedContact && !selectedGroup) return null;

  return (
    <>
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary">
          {selectedContact?.username || selectedGroup?.groupName}
        </h2>
        {selectedContact && (
          <p className="text-sm text-text-secondary">
            {selectedContact.status}
          </p>
        )}
        {selectedGroup && (
          <p className="text-sm text-text-secondary">
            {selectedGroup.users?.length || 0} members
          </p>
        )}
      </div>
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          customBackground ? "bg-custom" : chatBackground
        }`}
        style={
          customBackground
            ? {
                backgroundImage: `url(${customBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mx-auto mt-[2rem]">
            <p className="text-text-secondary text-lg">No messages yet.</p>
            <p className="text-text-secondary">
              Go on, start chatting with{" "}
              {selectedContact?.username || selectedGroup?.groupName}
            </p>
          </div>
        ) : (
          Object.entries(groupMessagesByDay(messages)).map(
            ([day, dayMessages]) => (
              <div key={day}>
                <div className="flex justify-center mb-4">
                  <span className="px-4 py-1 rounded-full bg-surface text-text-secondary text-xs">
                    {formatDayHeader(dayMessages[0].created_at)}
                  </span>
                </div>
                {dayMessages.map((message, index) => {
                  const prevMessage = dayMessages[index - 1];
                  const nextMessage = dayMessages[index + 1];
                  const shouldCombine = shouldCombineMessages(
                    message,
                    prevMessage
                  );
                  const nextMessageCombines =
                    nextMessage && shouldCombineMessages(nextMessage, message);
                  const isFromCurrentUser =
                    message.sent_from_id === currentUserId;

                  if (message.system_message === true) {
                    const action = message.content.split(" has")[1];

                    const username = message.content
                      .split("User ")[1]
                      ?.split(" has")[0];
                    return (
                      <div
                        className="text-center my-4"
                        key={`${message.messageId}-${index}`}
                      >
                        <p className="text-xs text-text-secondary mb-1">
                          {formatMessageDate(message.created_at)}
                        </p>
                        <span className="inline-block px-3 py-1 text-sm text-text-secondary bg-surface rounded-full">
                          User <span className="text-primary">{username}</span>{" "}
                          has {action}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${message.messageId}-${index}`}
                      className="relative group"
                      onClick={() => setHoveredMessageId(message.messageId)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      {/* Emoji Reaction Menu */}
                      {hoveredMessageId === message.messageId && (
                        <div
                          className={`absolute z-10 -top-8 left-0 right-0 flex ${
                            isFromCurrentUser ? "justify-end" : "justify-start"
                          } `}
                        >
                          <div className="flex gap-1 bg-surface border border-border rounded-full px-2 py-1 shadow-lg">
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() =>
                                  handleSubmitEmoji(emoji, message.messageId)
                                }
                                className={`hover:bg-primary-500 rounded-full p-1 transition-colors ${
                                  message.emoji === emoji
                                    ? "bg-primary-500"
                                    : ""
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex ${
                          isFromCurrentUser ? "justify-end" : "justify-start"
                        } ${shouldCombine ? "mt-0.5" : "mt-4"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg relative ${
                            isFromCurrentUser
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-surface text-text-primary border border-border rounded-bl-none"
                          } ${shouldCombine ? "rounded-t-lg" : ""}`}
                        >
                          {selectedGroup && (
                            <div className="absolute -bottom-2 -left-4 ">
                              {message.sent_from?.avatar ? (
                                <Image
                                  src={message.sent_from.avatar}
                                  alt={message.sent_from.username}
                                  width={24}
                                  height={24}
                                  className="rounded-full border border-border w-6 h-6"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center border border-border">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                              )}
                            </div>
                          )}

                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          {message.media_url && (
                            <Image
                              src={message.media_url}
                              width={200}
                              height={75}
                              alt="Shared image"
                              className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                              loading="lazy"
                            />
                          )}

                          {message.emoji && (
                            <div
                              className={`text-base bg-surface border border-border rounded-full px-2 py-1 shadow-lg absolute -top-5 ${
                                isFromCurrentUser ? "-left-4" : "-right-4"
                              }`}
                            >
                              {message.emoji}
                            </div>
                          )}

                          {!nextMessageCombines && (
                            <p
                              className={`text-xs mt-1 ${
                                isFromCurrentUser
                                  ? "text-primary-100"
                                  : "text-text-secondary"
                              }`}
                            >
                              {formatMessageDate(message.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )
        )}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}

export default Messages;
