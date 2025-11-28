// src/services/clerkService.js
import { Clerk } from "@clerk/backend";

const clerkClient = Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const getAllClerkUsers = async () => {
  const users = await clerkClient.users.getUserList({
    limit: 100,          // ambil max 100 user
    orderBy: "-created_at",
  });

  return users.data.map((u) => ({
    id: u.id,
    email: u.emailAddresses?.[0]?.emailAddress || null,
    username: u.username,
    first_name: u.firstName,
    last_name: u.lastName,
    created_at: u.createdAt,
  }));
};
