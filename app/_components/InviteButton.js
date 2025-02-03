"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Tooltip } from "react-tooltip";

export default function InviteButton() {
  const [tooltipText, setTooltipText] = useState("Copy URL to clipboard");

  // Function to copy the URL
  const copyToClipboard = async () => {
    try {
      const homepageURL = window.location.origin; // Gets the base URL of your site
      await navigator.clipboard.writeText(homepageURL);

      setTooltipText("✅ Copied!"); // Update tooltip text temporarily

      setTimeout(() => setTooltipText("Copy URL to clipboard"), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="tooltip-container">
      <button
        data-tooltip-id="invite-tooltip"
        data-tooltip-content={tooltipText}
        className="w-full flex items-center px-2 py-2 rounded-md text-text-secondary hover:bg-accent hover:text-text-primary transition-colors mb-1"
        onClick={copyToClipboard}
      >
        <UserPlus className="h-5 w-5 mr-3" />
        <span className="text-sm font-medium">Invite a Friend</span>
      </button>

      <Tooltip
        id="invite-tooltip"
        className="tooltip-diff-arrow"
        classNameArrow="tooltip-arrow"
        place="top"
        effect="solid"
      />
    </div>
  );
}
