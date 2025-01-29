import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createUser, getUserByEmail } from "./data-service";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    //Next Auth will call this function whenever someone tries to access the protected route
    authorized({ auth, request }) {
      return !!auth?.user; //Convert to a bool
    },
    //Called before logging in
    //Create a new user if they don't exist
    async signIn({ user, account, profile }) {
      try {
        const existingUser = await getUserByEmail(user.email);

        if (!existingUser)
          await createUser({
            email: user.email,
            username: user.name,
            avatar: user.image,
          });
        return true;
      } catch {
        return false; //Not logged in
      }
    },
    //Runs after signIn callback
    //Add userId to the session
    async session({ session }) {
      const currentUser = await getUserByEmail(session.user.email);
      session.user.userId = currentUser.userId;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
