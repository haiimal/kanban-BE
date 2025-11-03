// src/middleware/clerkIdInjectorWithLogging.js
import { verifyToken } from "@clerk/backend";

export const clerkIdInjectorWithLogging = async (req, res, next) => {
  try {
    let clerkUserId = null;

    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        // Verifikasi token Clerk
        const decoded = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        clerkUserId = decoded.sub; // "sub" = userId dari Clerk
      } catch (err) {
        console.warn("Clerk token invalid / expired:", err.message);
      }
    }

    // Fallback untuk development / Postman test
    if (!clerkUserId) {
      clerkUserId =
        req.headers["x-clerk-user-id"] || req.body?.clerk_user_id || null;
    }

    // Inject ke req biar bisa diakses di controller & service
    req.clerkId = clerkUserId;

    console.log(
      `Clerk ID injected: ${req.clerkId || "not provided"} | ${req.method} ${
        req.originalUrl
      }`
    );

    next();
  } catch (error) {
    console.error("Error in clerkIdInjectorWithLogging:", error.message);
    return res
      .status(401)
      .json({ error: "Unauthorized - Invalid or missing Clerk token" });
  }
};
