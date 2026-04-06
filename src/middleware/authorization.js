// src/middleware/authorization.js
import supabase from "../config/database.js";

// ambil role user dari DB
const getUserRole = async (projectId, clerkUserId) => {
  const { data, error } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", projectId)
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error) {
    console.error("Error getUserRole:", error.message);
    return null;
  }

  return data?.role;
};

// middleware utama
export const allowRoles = (roles = []) => {
  return async (req, res, next) => {
    try {
      const clerkUserId = req.clerkId;

      // ambil project_id dari berbagai kemungkinan
      const projectId =
        req.body.project_id ||
        req.params.project_id ||
        req.query.project_id;

      if (!projectId) {
        return res.status(400).json({
          error: "project_id is required for authorization",
        });
      }

      const role = await getUserRole(projectId, clerkUserId);

      console.log(`User Role: ${role}`);

      if (!role || !roles.includes(role)) {
        return res.status(403).json({
          error: "Forbidden - You don't have access",
        });
      }

      // inject role biar bisa dipakai di controller kalau perlu
      req.userRole = role;

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};