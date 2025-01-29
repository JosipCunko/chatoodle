"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  UserPlus,
  LogOut,
  ArrowLeftCircle,
  PaintBucket,
} from "lucide-react";
import { signOutAction } from "../_lib/actions";

export default function SettingsSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Go Back",
      path: "/chat",
      icon: <ArrowLeftCircle className="h-5 w-5 mr-3" />,
    },
    {
      label: "My Account",
      path: "/settings/account",
      icon: <User className="h-5 w-5 mr-3" />,
    },
    {
      label: "Appearance",
      path: "/settings/appearance",
      icon: <PaintBucket className="h-5 w-5 mr-3" />,
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className="w-60 flex flex-col bg-secondary border-r border-border">
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {navItems.map((item, i) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-2 py-2 rounded-md mb-1 ${
                isActive(item.path)
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-accent hover:text-text-primary"
              }
              ${i === 0 ? "mb-3 pb-4 border-b border-border" : ""}
              `}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center px-2 py-2 rounded-md text-text-secondary hover:bg-accent hover:text-text-primary transition-colors mb-1">
          <UserPlus className="h-5 w-5 mr-3" />
          <span className="text-sm font-medium">Invite a Friend</span>
        </button>

        <form action={signOutAction}>
          <button className="w-full flex items-center px-2 py-2 rounded-md text-text-secondary hover:bg-accent hover:text-text-primary transition-colors">
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
