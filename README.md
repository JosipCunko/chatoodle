## NextAuth.js with Google OAuth

- npm i next-auth@beta
- used https://generate-secret.vercel.app/ to create next auth secret key.

# Developer console

- on OAuth consent screen, publish the app so other users can log in.

Change these urls when app is deployed on some domain:

- Authorized JavaScript origins: http://localhost:3000
- Authorized redirect URIs: http://localhost:3000/api/auth/callback/google

# Supabase

- Added realtime updates
- on storage.objects crate RLS policies to allow anon users to upload to a storage bucket
