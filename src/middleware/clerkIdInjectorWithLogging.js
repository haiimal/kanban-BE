// src/middleware/clerkIdInjectorWithLogging.js
import { verifyToken } from "@clerk/backend";

export const clerkIdInjectorWithLogging = async (req, res, next) => {

  // Skip validasi token untuk preflight request
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("Missing Authorization header");
      return res.status(401).json({
        error: "Missing Authorization header. Bearer token required.",
      });
    }

    const token = authHeader.split(" ")[1];
    let clerkUserId = null;

    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      clerkUserId = decoded.sub; // user id Clerk
    } catch (err) {
      console.warn("Invalid Clerk token:", err.message);
      return res.status(401).json({ error: "Invalid or expired Clerk token." });
    }

    req.clerkId = clerkUserId;

    console.log(
      `Clerk ID injected: ${req.clerkId} | ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    console.error("Error in clerkIdInjectorWithLogging:", error.message);
    return res.status(401).json({
      error: "Unauthorized - Invalid or missing Clerk token",
    });
  }
};
