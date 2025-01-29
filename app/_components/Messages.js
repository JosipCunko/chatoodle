"use client";
import { memo, useState } from "react";
import {
  formatDayHeader,
  groupMessagesByDay,
  shouldCombineMessages,
  formatMessageDate,
} from "../_lib/utils";
import { updateMessageEmojiAction } from "@/app/_lib/actions";

const EMOJI_LIST = ["👍", "😀", "😭", "❌", "🤡"];

function Messages({
  selectedContact,
  messages,
  currentUserId,
  customBackground,
  chatBackground,
  messagesEndRef,
}) {
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  return (
    <>
      <div className="p-4 border-b border-border ">
        <h2 className="text-xl font-semibold text-text-primary">
          {selectedContact.username}
        </h2>
        <p className="text-sm text-text-secondary">{selectedContact.status}</p>
      </div>
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${chatBackground}`}
        style={
          chatBackground === "bg-custom" && customBackground
            ? {
                backgroundImage: `url(${customBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mx-auto mt-[2rem]">
            <p className="text-text-secondary text-lg">No messages yet.</p>
            <p className="text-text-secondary">
              Go on, start chatting with {selectedContact.username}
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

                  return (
                    <div
                      key={`${message.messageId}-${index}`}
                      className="relative group "
                      onMouseEnter={() =>
                        setHoveredMessageId(message.messageId)
                      }
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      {/* Emoji Reaction Menu */}
                      {hoveredMessageId === message.messageId && (
                        <div
                          className={`absolute -top-8 left-0 right-0 flex ${
                            isFromCurrentUser ? "justify-end" : "justify-start"
                          } `}
                        >
                          <div
                            className="flex gap-1 bg-surface border border-border rounded-full px-2 py-1 shadow-lg
                          "
                          >
                            {EMOJI_LIST.map((emoji) => (
                              <form
                                key={emoji}
                                action={updateMessageEmojiAction}
                              >
                                <input
                                  type="hidden"
                                  value={message.messageId}
                                  name="messageId"
                                />
                                <input
                                  type="hidden"
                                  value={emoji}
                                  name="emoji"
                                />

                                <button
                                  type="submit"
                                  className={`hover:bg-primary-500 rounded-full p-1 transition-colors ${
                                    message.emoji === emoji ? "bg-accent" : ""
                                  }`}
                                >
                                  {emoji}
                                </button>
                              </form>
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
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isFromCurrentUser
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-surface text-text-primary border border-border rounded-bl-none"
                          } ${shouldCombine ? "rounded-t-lg" : ""}`}
                        >
                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          {message.media_url && (
                            <img
                              src={message.media_url}
                              alt="Shared image"
                              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              loading="lazy"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  message.media_url
                                );
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          {message.emoji && (
                            <div className="text-xs mt-1">{message.emoji}</div>
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
