import { supabase } from "./supabase";

export async function getAllUsers() {
  const { data, error } = await supabase.from("Users").select("*");

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserByEmail(email) {
  const { data } = await supabase
    .from("Users")
    .select("*")
    .eq("email", email)
    .single();

  return data;
}

export async function getUserById(userId) {
  const { data: currentUser, error } = await supabase
    .from("Users")
    .select("*")
    .eq("userId", userId)
    .single();

  if (error) throw new Error(error.message);

  if (currentUser.contacts && currentUser.contacts.length > 0) {
    const validatedContacts = await Promise.all(
      currentUser.contacts.map(async (contact) => {
        // Fetch the actual user data for this contact
        const { data: contactUser, error: contactError } = await supabase
          .from("Users")
          .select("*")
          .eq("userId", contact.contactId)
          .single();

        if (contactError || !contactUser) {
          console.error(`Contact with ID ${contact.contactId} not found`);
          return null;
        }

        // Return the full contact data, regardless of username changes
        return contactUser;
      })
    );

    // Filter out only null values (deleted contacts)
    currentUser.contacts = validatedContacts.filter(
      (contact) => contact !== null
    );
  }

  return currentUser;
}

export async function createUser(userData) {
  const { data, error } = await supabase
    .from("Users")
    .insert([
      {
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
        phone_number: null,
        status: "offline",
        contacts: [],
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  console.log("Newly created user:", data);
  return data;
}

export async function getContactsByUserId(userId) {
  const { data: userData, error } = await supabase
    .from("Users")
    .select("contacts")
    .eq("userId", userId)
    .single();

  if (error) throw new Error(error.message);
  return userData.contacts || [];
}

export async function getMessagesBetweenUsers(currentUserId, otherUserId) {
  const { data, error } = await supabase
    .from("Messages")
    .select("*")
    .or(
      `and(sent_from_id.eq.${currentUserId},sent_to_id.eq.${otherUserId}),and(sent_from_id.eq.${otherUserId},sent_to_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getGroupMessages(groupId) {
  // First, get the group to retrieve the messages array
  const { data: group, error: groupError } = await supabase
    .from("Groups")
    .select("messages")
    .eq("groupId", groupId)
    .single();

  if (groupError) throw new Error(groupError.message);

  // If there are no messages, return an empty array
  if (!group || !group.messages || group.messages.length === 0) {
    return [];
  }

  // Now, fetch the messages from the Messages table using the message IDs
  const { data: messages, error: messagesError } = await supabase
    .from("Messages")
    .select("*")
    .in("messageId", group.messages); // Use the message IDs from the group

  if (messagesError) throw new Error(messagesError.message);

  return messages;
}

export async function getLastMessageForContact(userId, otherUserId) {
  const { data, error } = await supabase
    .from("Messages")
    .select("*")
    .or(
      `and(sent_from_id.eq.${userId},sent_to_id.eq.${otherUserId}),and(sent_from_id.eq.${otherUserId},sent_to_id.eq.${userId})`
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null; // PGRST116 is "no rows returned"
  return data;
}

export async function updatePhoneNumber(userId, phoneNumber) {
  const { error } = await supabase
    .from("Users")
    .update({ phone_number: phoneNumber })
    .eq("userId", userId);

  if (error) throw new Error(error.message);
}

export async function createContact(userId, newContact) {
  // First verify if the contact exists and username matches
  const { data: contactUser, error: contactError } = await supabase
    .from("Users")
    .select("username")
    .eq("userId", newContact.contactId)
    .single();

  if (contactError || !contactUser) {
    throw new Error("Contact user not found");
  }

  if (contactUser.username !== newContact.username) {
    throw new Error("Username does not match the provided contact ID");
  }

  // Get current user's contacts
  const { data: userData, error: getUserError } = await supabase
    .from("Users")
    .select("contacts")
    .eq("userId", userId)
    .single();

  if (getUserError) throw new Error(getUserError.message);

  // Check if contact already exists
  const existingContact = userData.contacts?.find(
    (contact) => contact.contactId === newContact.contactId
  );

  if (existingContact) {
    throw new Error("Contact already exists");
  }

  // Add the new contact to the contacts array
  const updatedContacts = [...(userData.contacts || []), newContact];

  // Update the user's contacts
  const { error: updateError } = await supabase
    .from("Users")
    .update({ contacts: updatedContacts })
    .eq("userId", userId);

  if (updateError) throw new Error(updateError.message);
}
export async function createGroup(group) {
  // First verify if the groupName exists
  const { data: existingGroup, error: groupsError } = await supabase
    .from("Groups")
    .select("*")
    .eq("groupName", group.groupName);

  if (groupsError) {
    throw new Error(groupsError.message);
  }
  if (existingGroup.length > 0) {
    throw new Error("Group with that name already exists");
  }

  // Add the new group to the "Groups" table
  const { error: insertError } = await supabase.from("Groups").insert([
    {
      groupId: group.groupId,
      groupName: group.groupName,
      users: group.users,
      messages: group.messages,
      logo: group.logo,
      admin: group.admin,
    },
  ]);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

// New function to subscribe to real-time updates
export function subscribeToMessages(callback) {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "Messages",
      },
      (payload) => {
        callback({
          ...payload,
          eventType: payload.eventType,
        });
      }
    )

    .subscribe();
}

export async function subscribeToGroupMessages(groupId, callback) {
  return supabase
    .channel(`group-messages-${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Messages",
        filter: `sent_to_id=eq.${groupId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
}

export const setUserOnline = async (userId) => {
  await supabase
    .from("Users")
    .update({ status: "online" })
    .eq("userId", userId);
};

export const setUserOffline = async (userId) => {
  await supabase
    .from("Users")
    .update({ status: "offline" })
    .eq("userId", userId);
};

export const setUserAway = async (userId) => {
  await supabase.from("Users").update({ status: "away" }).eq("userId", userId);
};

export async function leaveGroupchat(groupId, userId, userUsername) {
  const { data: group, fetchError } = await supabase
    .from("Groups")
    .select("*")
    .eq("groupId", groupId)
    .single();

  if (fetchError) throw fetchError;

  const updateGroupUsers = group.users.filter((uid) => uid !== userId);
  const { updateError } = await supabase
    .from("Groups")
    .update({ users: updateGroupUsers })
    .eq("groupId", groupId);

  if (updateError) throw updateError;

  // Create system message
  const { data: message, error: messageError } = await supabase
    .from("Messages")
    .insert({
      sent_to_id: groupId,
      content: `User ${userUsername} has left the groupchat`,
      system_message: true,
      sent_from_id: null,
    })
    .select()
    .single();

  if (messageError) throw messageError;

  const { insertError } = await supabase
    .from("Groups")
    .update({ messages: [...group.messages, message.messageId] })
    .eq("groupId", groupId);

  if (insertError) throw insertError;
}

export async function loadAvatarFromMessageId(messageId) {
  const { data: messageData, error: errorMessage } = await supabase
    .from("Messages")
    .select("*")
    .eq("messageId", messageId)
    .single();

  console.log(messageData);

  if (errorMessage) throw errorMessage;
}
