// src/middleware/platformRoleMiddleware.js
import supabase from "../config/database.js";

// =============================================
// HELPER: ambil platform role user
// =============================================
const getPlatformRole = async (clerkUserId) => {
  const { data, error } = await supabase
    .from("platform_roles")
    .select("role")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) {
    console.error("getPlatformRole error:", error.message);
    return null;
  }

  // Kalau tidak ada di tabel, berarti USER biasa
  return data?.role || "USER";
};

// =============================================
// MIDDLEWARE: hanya OWNER yang boleh akses
// → dipakai di ownerRoutes (laporan semua project)
// =============================================
export const requireOwner = async (req, res, next) => {
  try {
    const clerkUserId = req.clerkId;
    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized - tidak ada user ID" });
    }

    const role = await getPlatformRole(clerkUserId);
    if (role !== "OWNER") {
      return res.status(403).json({ error: "Forbidden - hanya Owner yang bisa mengakses ini" });
    }

    req.platformRole = "OWNER";
    next();
  } catch (err) {
    console.error("requireOwner error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// =============================================
// MIDDLEWARE: hanya PM (platform-level) yang boleh buat project
// → dipakai di POST /api/projects
// =============================================
export const requirePlatformPM = async (req, res, next) => {
  try {
    const clerkUserId = req.clerkId;
    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized - tidak ada user ID" });
    }

    const role = await getPlatformRole(clerkUserId);
    if (role !== "PM" && role !== "OWNER") {
      return res.status(403).json({ error: "Forbidden - hanya PM yang bisa membuat project" });
    }

    req.platformRole = role;
    next();
  } catch (err) {
    console.error("requirePlatformPM error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};