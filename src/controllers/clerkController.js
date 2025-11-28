// src/controllers/clerkController.js
import { getAllClerkUsers } from "../services/clerkService.js";

export const fetchClerkUsers = async (req, res) => {
  try {
    const users = await getAllClerkUsers();
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
