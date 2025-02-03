"use server";

import { revalidatePath } from "next/cache";
import {
  createContact,
  setUserOffline,
  setUserOnline,
  updatePhoneNumber,
  createGroup,
} from "./data-service";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { generateRandomInt8 } from "./utils";

export async function signInAction() {
  await signIn("google", { redirectTo: "/chat" });

  const { user } = await auth();
  await setUserOnline(user.userId);
}

export async function signOutAction() {
  const { user } = await auth();
  await setUserOffline(user.userId);

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
    const toId = formData.get("toId") || null;
    const groupId = formData.get("groupId") || null;
    const content = formData.get("content");
    const mediaUrl = formData.get("mediaUrl");

    console.log("Form data from sendMessageAction: ", formData);

    const { data, error } = await supabase
      .from("Messages")
      .insert([
        {
          sent_from_id: fromId,
          sent_to_id: toId || groupId,
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

export async function sendGroupMessageAction(formData) {
  try {
    const fromId = Number(formData.get("fromId"));
    const groupId = Number(formData.get("groupId"));
    const content = formData.get("content");
    const mediaUrl = formData.get("mediaUrl");

    //Send the message to the Messages table
    const { message } = await sendMessageAction(formData);
    const { messageId } = message;

    //messages column in "Groups" table is an array containing messageId from the "Messages" table. Do I need to link them with the foreign key in supabase?

    const { data: group, error: groupError } = await supabase
      .from("Groups")
      .select("messages")
      .eq("groupId", groupId)
      .single();
    if (groupError) throw groupError;

    const updatedMessages = [...(group.messages || []), messageId];

    // Update the group with the new messages array
    const { error: updateError } = await supabase
      .from("Groups")
      .update({ messages: updatedMessages })
      .eq("groupId", groupId);

    if (updateError) throw updateError;

    revalidatePath("/");
    return { success: true, message };
  } catch (error) {
    console.error("Send group message error:", error);
    return { error: error.message };
  }
}

export async function updateMessageEmojiAction(formData) {
  try {
    const messageId = Number(formData.get("messageId"));
    const emoji = formData.get("emoji");

    if (!messageId || !emoji) {
      throw new Error("Missing messageId or emoji");
    }

    // First, verify the message exists and log the result
    const { data: existingMessage, error: fetchError } = await supabase
      .from("Messages")
      .select("*")
      .eq("messageId", messageId)
      .single();

    console.log("Existing message:", existingMessage);

    if (fetchError) {
      console.log("Fetch error:", fetchError);
      throw fetchError;
    }

    if (!existingMessage) {
      throw new Error(`No message found with ID ${messageId}`);
    }

    // Toggle emoji
    const newEmoji = existingMessage.emoji === emoji ? null : emoji;

    const { data, error: updateError } = await supabase
      .from("Messages")
      .update({ emoji: newEmoji })
      .eq("messageId", messageId)
      .select();

    console.log("Update result:", { data, error: updateError });
    if (updateError) throw updateError;

    revalidatePath("/chat");
    return { success: true, emoji: newEmoji };
  } catch (err) {
    console.error("Update message emoji error:", err);
    return { error: err.message };
  }
}

export async function joinGroupAction(formData) {
  const groupId = Number(formData.get("groupId"));
  const groupName = formData.get("groupName").trim();

  try {
    const { data: group, error: groupError } = await supabase
      .from("Groups")
      .select("groupName, users")
      .eq("groupId", groupId)
      .single();

    if (groupError) throw groupError;
    if (!group) throw new Error("Group not found");

    // Verify the provided group name matches
    if (group.groupName !== groupName) {
      throw new Error("Incorrect group name");
    }

    const { user } = await auth();
    const userId = user.userId;
    if (!userId) throw new Error("Not authenticated");

    // Check if user is already in the group
    const users = group.users || [];
    if (users.some((uid) => uid === userId)) {
      throw new Error("You're already a member of this group");
    }

    // Add user to the group, array of userIds
    const updatedUsers = [...users, userId];
    const { error: updateError } = await supabase
      .from("Groups")
      .update({ users: updatedUsers })
      .eq("groupId", groupId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Join group error:", error);
    return { error: error.message };
  }
}

export async function createGroupAction(formData) {
  try {
    const groupName = formData.get("groupName").trim();
    const currentUserId = Number(formData.get("currentUserId"));

    const newGroup = {
      groupName,
      groupId: generateRandomInt8(),
      users: [currentUserId],
      messages: [],
      logo: null,
      admin: currentUserId,
    };

    await createGroup(newGroup);

    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Create group error:", error);
    return { error: error.message };
  }
}
