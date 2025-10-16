// src/middleware/clerkIdInjectorWithLogging.js

export const clerkIdInjectorWithLogging = (req, res, next) => {
  try {
    // Ambil Clerk ID dari middleware Clerk (kalau sudah aktif)
    const clerkUserIdFromAuth = req.auth?.userId;

    // Kalau belum ada, fallback ke body atau header
    const clerkUserIdFromBody = req.body?.clerk_user_id;
    const clerkUserIdFromHeader = req.headers["x-clerk-id"];

    // Tentukan nilai akhir Clerk ID
    req.clerkId =
      clerkUserIdFromAuth ||
      clerkUserIdFromBody ||
      clerkUserIdFromHeader ||
      null;

    // Logging biar gampang debug
    console.log(
      `Clerk ID injected: ${
        req.clerkId || "not provided"
      } | ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    console.error("Error in clerkIdInjectorWithLogging:", error);
    next(error);
  }
};
