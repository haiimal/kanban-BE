// src/middleware/clerkIdInjectorWithLogging.js
import { verifyToken } from "@clerk/clerk-sdk-node";

export const clerkIdInjectorWithLogging = async (req, res, next) => {
  try {
    let clerkUserId = null;

    // Cek apakah ada header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        // Verifikasi token Clerk
        const decoded = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        clerkUserId = decoded.sub; // "sub" = userId di Clerk
      } catch (err) {
        console.warn("Clerk token invalid atau expired:", err.message);
      }
    }

    // Fallback buat Postman
    if (!clerkUserId) {
      clerkUserId =
        req.headers["x-clerk-user-id"] || req.body?.clerk_user_id || null;
    }

    // Simpan ke request biar bisa diakses di controller
    req.clerkId = clerkUserId;

    console.log(
      `Clerk ID injected: ${req.clerkId || "not provided"} | ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    console.error("Error in clerkIdInjectorWithLogging:", error.message);
    res.status(401).json({ error: "Unauthorized - Invalid Clerk Token" });
  }
};
