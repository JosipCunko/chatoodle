## NextAuth.js with Google OAuth

npm i next-auth@beta

On google developer console, on OAuth consent screen, publish the app so other users can log in.

Used generate secret key by vercel to create next auth secret key.

# Change these urls when app is deployed on some domain

Authorized JavaScript origins: http://localhost:3000
Authorized redirect URIs: http://localhost:3000/api/auth/callback/google

Real time updates
useEffect(() => {
const subscription = supabase
.from('contacts')
.on('\*', payload => {
console.log('Change received!', payload);
// Update your UI based on the payload
})
.subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };

}, []);
