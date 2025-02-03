"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Users, X, Mail, Phone } from "lucide-react";
import { useOutsideClick } from "@/app/_lib/hooks";
import StatusIndicator from "./StatusIndicator";
import { getUserById } from "../_lib/data-service";
import { Tooltip } from "react-tooltip";
import { copyToClipboard, errorToast, successToast } from "../_lib/utils";
import { leaveGroupchatAction } from "../_lib/actions";

export default function ChatInfo({
  selectedContact,
  selectedGroup,
  messages,
  currentUserId,
  setSelectedGroup,
  currentUser,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [tooltipText, setTooltipText] = useState("Copy ID to clipboard");
  const modalRef = useOutsideClick(() => {
    if (selectedImage) setSelectedImage(null);
  });

  const handleLeaveGroup = async () => {
    const response = await leaveGroupchatAction(
      selectedGroup.groupId,
      currentUserId,
      currentUser.username
    );
    setSelectedGroup(null);

    if (response.success)
      successToast(`You have left the ${selectedGroup.groupName} groupchat`);
    else if (response.error) {
      errorToast("Unable to leave that group");
    }
  };

  useEffect(() => {
    async function fetchGroupUsers() {
      if (selectedGroup?.users) {
        const usersData = await Promise.all(
          selectedGroup.users.map(async (userId) => {
            const userData = await getUserById(userId);
            return userData;
          })
        );
        setGroupUsers(usersData);
      }
    }
    fetchGroupUsers();
  }, [selectedGroup]);

  // Filter out messages with media_url and get unique images for group chat
  const sharedImages = messages
    .filter((msg) => msg.media_url)
    .map((msg) => msg.media_url)
    .reverse(); // Show newest first

  const displayImages = sharedImages.slice(0, 10);
  const hasMoreImages = sharedImages.length > 10;

  return (
    <>
      <div
        className="w-80 border-l border-border bg-background overflow-y-auto resize-x min-w-[240px] max-w-[400px] grid grid-cols-1 grid-rows-[min-content_1fr_min-content] h-full"
        style={{ resize: "horizontal", direction: "rtl" }}
      >
        <div
          className="p-6 text-center border-b border-border tooltip-container"
          style={{ direction: "ltr" }}
        >
          {/* User/Group Profile */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            {selectedContact && !selectedGroup ? (
              selectedContact.avatar ? (
                <>
                  <Image
                    src={selectedContact.avatar}
                    alt={selectedContact.username}
                    fill
                    className="rounded-full object-cover"
                  />
                  <StatusIndicator
                    userId={selectedContact.userId}
                    size="lg"
                    offset={-3}
                  />
                </>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-12 h-12 text-primary" />
                </div>
              )
            ) : selectedGroup.logo ? (
              <Image
                src={selectedGroup.logo}
                alt={selectedGroup.groupName}
                width={96}
                height={96}
                className="rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-border border">
                <Users className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            {selectedContact && !selectedGroup
              ? selectedContact.username
              : selectedGroup.groupName}
          </h2>
          {selectedGroup && (
            <p className="text-sm text-text-secondary mt-2 mb-2">
              {selectedGroup.users?.length || 0}{" "}
              {selectedGroup.users?.length === 1 ? "member" : "members"}
            </p>
          )}

          <p className="text-lg flex items-center justify-center gap-2 mt-2 -mb-1">
            {selectedContact ? "User ID" : "Group ID"}
            <span
              className="py-1 px-2 bg-surface rounded-xl cursor-pointer"
              onClick={() => {
                if (selectedGroup) {
                  copyToClipboard(selectedGroup.groupId, setTooltipText);
                } else if (selectedContact) {
                  copyToClipboard(selectedContact.userId, setTooltipText);
                }
              }}
              data-tooltip-id="tooltip-copy"
              data-tooltip-content={tooltipText}
            >
              {selectedContact ? selectedContact.userId : selectedGroup.groupId}
            </span>
          </p>
          <Tooltip
            id="tooltip-copy"
            className="tooltip-diff-arrow"
            classNameArrow="tooltip-arrow"
          />

          {selectedGroup && (
            <div className="mt-4">
              <button
                onClick={handleLeaveGroup}
                className="w-full bg-danger/45 text-white py-2 rounded-lg hover:bg-danger/40 transition-colors"
              >
                Leave Group
              </button>
            </div>
          )}
        </div>

        {/* Image Gallery */}
        <div
          className="p-6 border-b border-border"
          style={{ direction: "ltr" }}
        >
          <h3 className="text-sm font-medium text-text-secondary mb-4">
            {displayImages.length > 0 ? "Shared images" : "No shared images"}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
                onClick={() => setSelectedImage(imageUrl)}
                className="relative aspect-square w-full overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
              >
                <Image
                  src={imageUrl}
                  alt={`Shared image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
            {hasMoreImages && (
              <div className="aspect-square w-full rounded-lg bg-background/50 flex items-center justify-center">
                <span className="text-sm text-text-secondary font-medium">
                  {sharedImages.length - 10}+
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Group Members */}
        {selectedGroup && (
          <div
            className="p-6 border-b border-border"
            style={{ direction: "ltr" }}
          >
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              Group Members
            </h3>
            <div className="space-y-4">
              {groupUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative">
                    {user.avatar ? (
                      <>
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          fill
                          sizes="32px"
                          className="rounded-full object-cover"
                          priority
                        />
                        <StatusIndicator userId={user.userId} />
                      </>
                    ) : (
                      <Users className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 ">
                    {selectedGroup.admin === user.userId && (
                      <p className="text-xs text-primary">Admin</p>
                    )}
                    <p className="text-sm text-text-primary">{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {selectedContact && (
          <div className="p-6 space-y-4" style={{ direction: "ltr" }}>
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              Contact Info
            </h3>

            {/* Email */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-text-secondary text-xs">Email address</p>
                <p className="text-text-primary truncate">
                  {selectedContact?.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-text-secondary text-xs">Phone number</p>
                <p className="text-text-primary">
                  {selectedContact?.phone_number
                    ? selectedContact?.phone_number
                    : "Phone number is not specified"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="relative max-w-4xl max-h-[90vh] w-full mx-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 p-2 bg-surface text-text-primary rounded-full hover:bg-accent transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={selectedImage}
              alt="Selected image"
              width={2100}
              height={800}
              className="rounded-lg object-contain max-h-[90vh] w-auto mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
