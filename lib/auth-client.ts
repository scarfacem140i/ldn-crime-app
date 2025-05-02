import { createAuthClient } from "better-auth/react";
import { anonymousClient, adminClient } from "better-auth/client/plugins";

export const { signIn, signUp, useSession, signOut, admin, ...authClient } =
  createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [anonymousClient(), adminClient()],
  });
