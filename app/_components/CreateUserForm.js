/*NOT USED ANYMORE */

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { successToast, errorToast } from "@/app/_lib/utils";
import { useRouter } from "next/navigation"; //next/navigation must be

async function createUserAction(formData) {
  "use server";

  try {
    const avatarFile = formData.get("avatar");
    const username = formData.get("username");
    const email = formData.get("email");

    if (!username || (!avatarFile && email)) {
      return { error: "Please provide all required fields" };
    }

    const avatarBuffer = await avatarFile.arrayBuffer();
    const avatarBytes = new Uint8Array(avatarBuffer);

    const imageName = `${Date.now()}-${username
      .toLowerCase()
      .replace(/\s+/g, "-")}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("Avatars")
      .upload(imageName, avatarBytes, {
        contentType: avatarFile.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "Failed to upload avatar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("Avatars").getPublicUrl(imageName);

    const userData = {
      username: username,
      email: email,
      avatar: publicUrl,
      status: "offline",
      contacts: [],
    };

    await createUser(userData);
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Create user error:", err);
    return { error: err.message };
  }
}

export default function CreateUserForm({ onClose, isSignupPage = false }) {
  "use client";

  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);
  const router = useRouter();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  async function handleSubmit(formData) {
    // Make sure to append the actual file, not the preview URL
    if (selectedFile) {
      formData.set("avatar", selectedFile);
    }

    // Add email field for signup
    const email = formData.get("email");
    if (isSignupPage && !email) {
      errorToast("Please provide an email address");
      return;
    }

    const response = await createUserAction(formData);

    if (response.error) {
      errorToast(response.error);
    }
    if (response.success) {
      successToast("Account created successfully!");

      if (!isSignupPage) {
        onClose();
      } else {
        router.push("/");
      }
    }
  }

  const formContent = (
    <>
      <form action={handleSubmit} className="space-y-6">
        {/* Email Input - Only show on signup page */}
        {isSignupPage && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              placeholder="Enter your email"
            />
          </div>
        )}

        {/* Username Input */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
            placeholder="Enter username"
          />
        </div>

        {/* Image Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
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
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {preview ? (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-full"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="avatar"
              className="flex flex-col items-center cursor-pointer p-4"
            >
              <Upload className="h-10 w-10 text-text-secondary mb-2" />
              <p className="text-sm text-text-secondary mb-1">
                Drag and drop an image, or click to select
              </p>
              <p className="text-xs text-text-secondary">PNG, JPG up to 10MB</p>
            </label>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isSignupPage ? "Sign Up" : "Create User"}
        </button>
      </form>
    </>
  );

  if (isSignupPage) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
}
