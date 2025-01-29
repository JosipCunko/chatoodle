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
          .select("userId, username, avatar, status")
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

export async function getMessagesBetweenUsers(userId1, userId2) {
  const { data, error } = await supabase
    .from("Messages")
    .select("*")
    .or(
      `and(sent_from_id.eq.${userId1},sent_to_id.eq.${userId2}),and(sent_from_id.eq.${userId2},sent_to_id.eq.${userId1})`
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
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

export function subscribeToMessages(callback) {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Messages",
      },
      (payload) => callback(payload)
    )
    .subscribe();
}
