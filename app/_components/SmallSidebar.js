"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Plus, MessagesSquare, MessageSquareDiff } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useGlobalContext } from "./GlobalContextProvider";
import { supabase } from "@/app/_lib/supabase";
import JoinGroupForm from "./JoinGroupForm";
import CreateGroupForm from "./CreateGroupForm";

export default function SmallSidebar({ currentUserId }) {
  const { selectedGroup, setSelectedGroup, setSelectedContact } =
    useGlobalContext();
  //Groups that currentUser is part of
  const [groups, setGroups] = useState([]);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      const { data: groups, error } = await supabase.from("Groups").select("*");
      const userGroups = groups.filter((group) => {
        return group.users.includes(currentUserId);
      });

      if (error) {
        console.error("Error loading groups:", error);
        return;
      }

      setGroups(userGroups);
    }

    loadGroups();

    // Subscribe to changes - Fixed by wrapping loadGroups in a callback
    const channel = supabase
      .channel("groups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Groups" },
        (payload) => {
          loadGroups(); // Now wrapped in a callback function
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  return (
    <div className="w-[72px] border-r border-border h-full bg-secondary flex flex-col items-center pt-3 space-y-2 z-50 tooltip-container">
      {/* App Logo */}
      <Link
        href="/"
        className="w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 flex items-center justify-center bg-background mb-2"
        data-tooltip-id="tooltip-home"
        data-tooltip-content="Home"
      >
        {/*FIX IMAGG LOADING */}
        <Image
          src="/icon.png"
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

      {/* Join Group Button */}
      <button
        onClick={() => setShowJoinForm(true)}
        className="w-12 h-12 rounded-2xl hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center bg-accent border border-primary-500 text-white  "
        data-tooltip-id="tooltip-join"
        data-tooltip-content="Join a group"
      >
        <MessagesSquare className="w-5 h-5" />
      </button>
      <Tooltip
        id="tooltip-join"
        place="right"
        className="tooltip-diff-arrow"
        classNameArrow="tooltip-arrow"
      />

      {/* Create Group Button */}
      <button
        onClick={() => setShowCreateGroupForm(true)}
        className="w-12 h-12 rounded-2xl hover:scale-110 transition-all duration-300 ease-in-out flex items-center justify-center bg-accent border border-primary-500 text-white"
        data-tooltip-id="tooltip-create-group"
        data-tooltip-content="Create a group"
      >
        <MessageSquareDiff className="w-5 h-5" />
      </button>
      <Tooltip
        id="tooltip-create-group"
        place="right"
        className="tooltip-diff-arrow"
        classNameArrow="tooltip-arrow"
      />

      {/* Separator */}
      <div className="w-8 h-0.5 bg-border rounded-full" />

      {/* Groups */}
      {groups.map((group) => (
        <div key={group.groupId} className="relative">
          <button
            onClick={() => {
              selectedGroup?.groupId === group.groupId
                ? setSelectedGroup(null)
                : setSelectedGroup(group);
              setSelectedContact(null);
            }}
            className={`w-12 h-12 rounded-full hover:rounded-2xl transition-all duration-200 flex items-center justify-center bg-primary/10 group relative ${
              selectedGroup?.groupId === group.groupId
                ? "bg-primary rounded-2xl"
                : ""
            }`}
            data-tooltip-id={`tooltip-group-${group.groupId}`}
            data-tooltip-content={group.groupName}
          >
            {group.logo ? (
              <Image
                src={group.logo}
                alt={group.groupName}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <Users
                className={`w-5 h-5 text-primary group-hover:text-white
                ${
                  selectedGroup?.groupId === group.groupId ? "text-white" : ""
                }`}
              />
            )}
          </button>
          <Tooltip
            id={`tooltip-group-${group.groupId}`}
            place="right"
            className="tooltip-diff-arrow"
            classNameArrow="tooltip-arrow"
          />
        </div>
      ))}

      {showJoinForm && <JoinGroupForm onClose={() => setShowJoinForm(false)} />}
      {showCreateGroupForm && (
        <CreateGroupForm
          onClose={() => setShowCreateGroupForm(false)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
