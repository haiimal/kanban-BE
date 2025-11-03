// src/controllers/userController.js
export const syncUser = async (req, res) => {
  try {
    const { clerkId } = req.body;

    if (!clerkId) return res.status(400).json({ error: "Clerk ID wajib dikirim" });

    // cek apakah user sudah terdaftar
    const { data: existing } = await supabase
      .from("project_member")
      .select("*")
      .eq("clerk_user_id", clerkId)
      .maybeSingle();

    if (existing) {
      return res.json({ message: "User sudah terdaftar" });
    }

    // kalau belum, tambahkan sebagai default member
    const { data, error } = await supabase
      .from("project_member")
      .insert([{ clerk_user_id: clerkId, role: "member" }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ message: "User disinkronkan", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
