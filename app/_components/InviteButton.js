"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { copyToClipboard } from "@/app/_lib/utils";

export default function InviteButton() {
  const [tooltipText, setTooltipText] = useState("Copy URL to clipboard");

  return (
    <div className="tooltip-container">
      <button
        data-tooltip-id="invite-tooltip"
        data-tooltip-content={tooltipText}
        className="w-full flex items-center px-2 py-2 rounded-md text-text-secondary hover:bg-accent hover:text-text-primary transition-colors mb-1"
        onClick={() => copyToClipboard(window.location.origin, setTooltipText)}
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
