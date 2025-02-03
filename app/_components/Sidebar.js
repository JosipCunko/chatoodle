"use client";

import { useState, useEffect } from "react";
import { Search, Settings, Plus, User, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ContactUser from "./ContactUser";
import CreateContactForm from "./CreateContactForm";
import { useGlobalContext } from "./GlobalContextProvider";
import { Tooltip } from "react-tooltip";
import StatusIndicator from "./StatusIndicator";

export default function Sidebar({ currentUser }) {
  const pathname = usePathname();
  const { selectedContact, setSelectedContact, setSelectedGroup } =
    useGlobalContext();
  const [showContactForm, setShowContactForm] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    {
      icon: Bot,
      label: "Chatoodle AI",
      path: "/ai",
      tooltip: "Chat with our AI model",
    },
  ];

  useEffect(() => {
    if (currentUser?.contacts) {
      const filtered = currentUser.contacts.filter((contact) =>
        contact.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [currentUser?.contacts, searchQuery]);

  return (
    <>
      <div className="w-60 flex flex-col bg-background border-r border-sidebar-divider">
        <div className="p-2 bg-background">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sidebar-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-sidebar-secondary text-text-primary placeholder-sidebar-muted"
            />
            <Search
              className="absolute left-3 top-2.5 text-sidebar-muted"
              size={20}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-background mb-3">
          {navItems.map((item) => (
            <div key={item.path} className="tooltip-container">
              <Link
                href={item.path}
                className={`flex items-center px-2 py-2 rounded-md mb-1 ${
                  pathname === item.path
                    ? "bg-sidebar-active text-white"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-text-primary"
                }`}
                data-tooltip-id="tooltip-tabs"
                data-tooltip-content={item.tooltip}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>

              <Tooltip
                id="tooltip-tabs"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
            </div>
          ))}
        </div>

        {/*Contacts Section
         */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          <div className="flex-1 overflow-y-auto">
            {currentUser.contacts.length !== 0 ? (
              <>
                <p className="text-text-secondary text-sm px-3 py-1 uppercase">
                  {filteredContacts.length === 1
                    ? `${filteredContacts.length} friend`
                    : `${filteredContacts.length} friends`}
                </p>

                <ul className="divide-y divide-sidebar-divider">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.userId}
                      onClick={() => {
                        setSelectedContact(
                          contact.userId === selectedContact?.userId
                            ? null
                            : contact
                        );
                        setSelectedGroup(null);
                      }}
                      className={` cursor-pointer ${
                        contact.userId === selectedContact?.userId
                          ? "bg-sidebar-active"
                          : ""
                      }
                ${
                  contact.userId === selectedContact?.userId
                    ? ""
                    : "hover:bg-sidebar-hover"
                }
                  `}
                    >
                      <ContactUser
                        name={contact.username}
                        status={contact.status}
                        avatar={contact.avatar}
                        currentUserId={currentUser.userId}
                        contactUserId={contact.userId}
                      />
                    </div>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-text-secondary text-sm px-3 py-1 uppercase">
                No contacts yet
              </p>
            )}
          </div>
        </div>

        {/* User Info Section - Fixed at Bottom */}
        <div className="border-t border-sidebar-divider p-2 bg-sidebar-secondary">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center flex-1">
              <div className="relative w-8 h-8  ">
                {currentUser.avatar ? (
                  <>
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      fill
                      sizes="32px"
                      className="rounded-full object-cover"
                      priority
                    />
                    <StatusIndicator userId={currentUser.userId} />
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-2 flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {currentUser.username}
                </p>
                <p className="text-xs text-sidebar-muted truncate">
                  #{String(currentUser.userId).padStart(4, "0")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 tooltip-container">
              <button
                onClick={() => setShowContactForm(true)}
                className="p-2 rounded-full hover:bg-sidebar-hover transition-colors"
                data-tooltip-id="tooltip-add-contact"
                data-tooltip-content="Add a new friend"
              >
                <Plus className="h-5 w-5 text-sidebar-muted hover:text-text-primary" />
              </button>
              <Tooltip
                id="tooltip-add-contact"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
              <Link
                href="/settings"
                className="p-2 rounded-full hover:bg-sidebar-hover 
                transition-colors"
                data-tooltip-id="tooltip-settings"
                data-tooltip-content="Account and Settings"
              >
                <Settings className="h-5 w-5 text-sidebar-muted hover:text-text-primary" />
              </Link>
              <Tooltip
                id="tooltip-settings"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
                // border="1px solid var(--primary)"
              />
            </div>
          </div>
        </div>
      </div>

      {showContactForm && (
        <CreateContactForm
          userId={currentUser.userId}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </>
  );
}
