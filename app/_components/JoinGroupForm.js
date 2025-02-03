"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { joinGroupAction } from "@/app/_lib/actions";
import { errorToast, successToast } from "@/app/_lib/utils";
import { useOutsideClick } from "../_lib/hooks";

export default function JoinGroupForm({ onClose }) {
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const ref = useOutsideClick(onClose);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("groupId", groupId);

    const response = await joinGroupAction(formData);

    if (response.error) {
      errorToast(response.error);
      return;
    }

    successToast("Successfully joined the group!");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={ref}
        className="bg-background rounded-lg p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Join a Group
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-text-primary"
              required
            />
          </div>

          <div>
            <label
              htmlFor="groupId"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Group ID
            </label>
            <input
              type="text"
              id="groupId"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-text-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition duration-150 ease-in-out"
          >
            Join Group
          </button>
        </form>
      </div>
    </div>
  );
}
