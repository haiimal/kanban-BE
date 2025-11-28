// src/controllers/clerkController.js
import { getAllClerkUsers } from "../services/clerkService.js";

export const listClerkUsers = async (req, res) => {
  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const users = await getAllClerkUsers();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua user Clerk",
      data: users,
    });
  } catch (err) {
    console.error("Clerk List Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
