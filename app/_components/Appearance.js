"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Switch from "./Switch";
import { useGlobalContext } from "./GlobalContextProvider";

export default function Appearance() {
  const {
    darkMode,
    toggleDarkMode,
    chatBackground,
    updateChatBackground,
    customBackground,
    updateCustomBackground,
  } = useGlobalContext();

  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const backgroundOptions = [
    { value: "bg-chatbg-default", label: "Default" },
    { value: "bg-chatbg-stone", label: "Stone" },
    { value: "bg-chatbg-neutral", label: "Neutral" },
    { value: "bg-chatbg-zinc", label: "Zinc" },
    { value: "bg-chatbg-gray", label: "Gray" },
    { value: "bg-custom", label: "Custom Image" },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await handleImageUpload(file);
    }
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    // Convert image to base64 for now
    // In a real app, you'd upload to a server/CDN
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCustomBackground(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearCustomBackground = () => {
    updateCustomBackground(null);
    updateChatBackground("bg-chatbg-default");
  };

  return (
    <div className="space-y-6">
      {/* Theme Setting */}
      <div className="flex items-center gap-12">
        <div>
          <h3 className="font-medium mb-1">Dark Mode</h3>
          <p className="text-sm text-text-secondary">
            Toggle between dark and light theme
          </p>
        </div>
        <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
      </div>

      {/* Chat Background Setting */}
      <div>
        <h3 className="font-medium mb-1">Chat Background</h3>
        <p className="text-sm text-text-secondary mb-2">
          Choose your preferred chat background
        </p>
        <select
          value={chatBackground}
          onChange={(e) => updateChatBackground(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-md border border-border bg-background text-text-primary mb-4"
        >
          {backgroundOptions.map((option) => {
            if (!customBackground && option.label === "Custom Image")
              return null;
            else
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
          })}
        </select>

        <p className="text-sm text-text-secondary mb-2">
          or upload a custom image
        </p>

        {/* Custom Background Upload */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center mt-4 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {customBackground ? (
            <div className="relative">
              <img
                src={customBackground}
                alt="Custom background"
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                onClick={clearCustomBackground}
                className="absolute -top-2 -right-2 p-1 bg-surface text-text-primary rounded-full hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center cursor-pointer p-4"
              onClick={() => inputRef.current.click()}
            >
              <Upload className="h-10 w-10 text-text-secondary mb-2" />
              <p className="text-sm text-text-secondary mb-1">
                Drag and drop an image, or click to select
              </p>
              <p className="text-xs text-text-secondary">PNG, JPG up to 10MB</p>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
