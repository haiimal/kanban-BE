// src/routes/clerkRoutes.js
import express from "express";
import { fetchClerkUsers } from "../controllers/clerkController.js";
import supabase from "../config/database.js";

const router = express.Router();

router.get("/", fetchClerkUsers);

// GET /api/clerk-users/me
// Mengembalikan platform role user yang sedang login
// Dipakai frontend untuk menentukan menu yang ditampilkan
router.get("/me", async (req, res) => {
  try {
    const clerkUserId = req.clerkId;
    if (!clerkUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("platform_roles")
      .select("role")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Kalau tidak ada di tabel platform_roles → USER biasa
    const role = data?.role || "USER";

    res.json({ success: true, data: { clerk_user_id: clerkUserId, platform_role: role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;