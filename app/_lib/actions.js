"use server";

import { revalidatePath } from "next/cache";
import { createContact, updatePhoneNumber } from "./data-service";
import { signIn, signOut } from "./auth";
import { supabase } from "./supabase";

export async function signInAction() {
  await signIn("google", { redirectTo: "/chat" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updatePhoneNumberAction(formData) {
  try {
    const phoneNumber = Number(formData.get("phoneNumber"));
    const currentUserId = Number(formData.get("currentUserId"));
    await updatePhoneNumber(currentUserId, phoneNumber);

    revalidatePath("/settings/account");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function createContactAction(formData) {
  try {
    const userId = formData.get("userId");
    const newContact = {
      username: formData.get("username"),
      contactId: Number(formData.get("contactId")),
    };

    await createContact(userId, newContact);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function sendMessageAction(formData) {
  try {
    const fromId = formData.get("fromId");
    const toId = formData.get("toId");
    const content = formData.get("content");
    const mediaUrl = formData.get("mediaUrl");

    const { data, error } = await supabase
      .from("Messages")
      .insert([
        {
          sent_from_id: fromId,
          sent_to_id: toId,
          content,
          media_url: mediaUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: data };
  } catch (err) {
    console.error("Send message error:", err);
    return { error: err.message };
  }
}

export async function updateMessageEmojiAction(formData) {
  try {
    const messageId = Number(formData.get("messageId"));
    const emoji = formData.get("emoji");
    console.warn("Server Action Called:", { messageId, emoji });

    if (!messageId || !emoji) {
      throw new Error("Missing messageId or emoji");
    }

    const { data: existingMessage, error: fetchError } = await supabase
      .from("Messages")
      .select("emoji")
      .eq("messageId", messageId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle emoji: if same emoji exists, remove it; otherwise set new emoji
    const newEmoji = existingMessage?.emoji === emoji ? null : emoji;

    const { error: updateError } = await supabase
      .from("Messages")
      .update({ emoji: newEmoji })
      .eq("messageId", messageId);

    if (updateError) throw updateError;

    return { success: true, emoji: newEmoji };
  } catch (err) {
    console.error("Update message emoji error:", err);
    return { error: err.message };
  }
}
