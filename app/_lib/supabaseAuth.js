import supabase from "./supabase";
import { createUser, getUserByEmail } from "./data-service";

/*NOT USED */

export async function signup({ fullName, email, password }) {
  // First check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: "",
      },
    },
  });

  if (error) throw new Error(error.message);

  // Create the user in your database
  try {
    const userData = {
      username: fullName,
      email: email,
      avatar: "",
      userId: data.user.id, // Use Supabase user ID
      status: "online",
      contacts: [],
    };

    await createUser(userData);
  } catch (err) {
    // If database creation fails, we should probably delete the auth user
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error("Failed to create user profile");
  }

  return data;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  // Update user status to online
  try {
    const { error: updateError } = await supabase
      .from("Users")
      .update({ status: "online" })
      .eq("email", email);

    if (updateError) throw updateError;
  } catch (err) {
    console.error("Failed to update user status:", err);
  }

  return data;
}

export async function logout() {
  // Get current user before logging out
  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user) {
    // Update status to offline
    try {
      const { error: updateError } = await supabase
        .from("Users")
        .update({ status: "offline" })
        .eq("email", userData.user.email);

      if (updateError) throw updateError;
    } catch (err) {
      console.error("Failed to update user status:", err);
    }
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);

  // Get additional user data from your database
  try {
    const userData = await getUserByEmail(data.user.email);
    return { ...data.user, ...userData };
  } catch (err) {
    console.error("Failed to get user data:", err);
    return data.user;
  }
}

export async function updateCurrentUser({ fullName, avatar, password }) {
  let updateData = {};

  if (password) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });
    if (passwordError) throw new Error(passwordError.message);
  }

  if (fullName || avatar) {
    const { error: userError } = await supabase.auth.updateUser({
      data: {
        fullName: fullName || undefined,
        avatar: avatar || undefined,
      },
    });
    if (userError) throw new Error(userError.message);

    // Update user profile in your database
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const updates = {};
      if (fullName) updates.username = fullName;
      if (avatar) updates.avatar = avatar;

      const { error: updateError } = await supabase
        .from("Users")
        .update(updates)
        .eq("email", currentUser.user.email);

      if (updateError) throw updateError;
    } catch (err) {
      throw new Error("Failed to update user profile");
    }
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);

  return data;
}
