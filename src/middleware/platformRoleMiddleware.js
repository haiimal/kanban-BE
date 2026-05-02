// src/middleware/platformRoleMiddleware.js
import supabase from "../config/database.js";

// Cek apakah user terdaftar sebagai OWNER di platform_roles
export const requireOwner = async (req, res, next) => {
  try {
    const clerkUserId = req.clerkId;

    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("platform_roles")
      .select("role")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data || data.role !== "OWNER") {
      return res.status(403).json({ error: "Forbidden - hanya Owner yang bisa akses" });
    }

    next();
  } catch (err) {
    console.error("requireOwner error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Cek apakah user terdaftar sebagai PM di platform_roles
export const requirePlatformPM = async (req, res, next) => {
  try {
    const clerkUserId = req.clerkId;

    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("platform_roles")
      .select("role")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data || data.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden - hanya ADMIN yang bisa membuat project" });
    }

    next();
  } catch (err) {
    console.error("requirePlatformPM error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};