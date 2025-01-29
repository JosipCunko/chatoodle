"use client";

import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { Tooltip } from "react-tooltip";

export default function SmallSidebar() {
  const pathname = usePathname();

  // Placeholder group chats (will be replaced with real data later)
  const groupChats = [
    { groupId: 1, name: "Gaming Squad" },
    { groupId: 2, name: "Study Group" },
    { groupId: 3, name: "Family" },
  ];

  return (
    <div className="w-[72px] border-r border-border h-full bg-secondary flex flex-col items-center pt-3 space-y-2 z-50">
      {/* App Logo */}
      <Link
        href="/"
        className="w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 flex items-center justify-center bg-background mb-2"
        data-tooltip-id="tooltip-home"
        data-tooltip-content="Home"
      >
        <Image
          src="/Chatoodle2-logo.png"
          alt="Chatoodle"
          width={40}
          height={40}
          className="rounded-full"
        />
      </Link>
      <Tooltip
        id="tooltip-home"
        place="right"
        className="tooltip-diff-arrow"
        classNameArrow="tooltip-arrow"
      />

      {/* Separator */}
      <div className="w-8 h-0.5 bg-border rounded-full" />

      {/* Group Chats */}
      {groupChats.map((group) => (
        <div key={group.groupId} className="relative">
          <button
            className={`w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 flex items-center justify-center bg-primary/10 group relative ${
              pathname === `/chat/${group.groupId}`
                ? "bg-primary rounded-2xl "
                : ""
            }`}
            data-tooltip-id={`tooltip-group-${group.groupId}`}
            data-tooltip-content={group.name}
          >
            <Users
              className={`w-5 h-5 text-primary group-hover:text-white
              ${
                pathname === `/chat/${group.groupId}`
                  ? "text-text-primary "
                  : ""
              }
              `}
            />
          </button>
          <Tooltip
            id={`tooltip-group-${group.id}`}
            place="right"
            className="tooltip-diff-arrow"
            classNameArrow="tooltip-arrow"
          />
        </div>
      ))}
    </div>
  );
}
