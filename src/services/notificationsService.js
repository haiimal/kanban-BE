import supabase from "../config/database.js";

// Helper kirim notif
export const createNotification = async ({ recipient_clerk_id, sender_clerk_id, type, message, card_id = null }) => {
  if (recipient_clerk_id === sender_clerk_id) return; // jangan kirim notif ke diri sendiri
  await supabase.from("notifications").insert([{
    recipient_clerk_id,
    sender_clerk_id,
    type,
    message,
    card_id,
  }]);
};

// Ambil semua notif milik user
export const getNotifications = async (clerkId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_clerk_id", clerkId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

// Tandai 1 notif sudah dibaca
export const markAsRead = async (id, clerkId) => {
  const { data: notif } = await supabase
    .from("notifications")
    .select("recipient_clerk_id")
    .eq("id", id)
    .single();
  if (!notif) throw new Error("Notifikasi tidak ditemukan");
  if (notif.recipient_clerk_id !== clerkId) throw new Error("Bukan notifikasi kamu");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};

// Tandai semua notif sudah dibaca
export const markAllAsRead = async (clerkId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_clerk_id", clerkId)
    .eq("is_read", false);
  if (error) throw new Error(error.message);
  return true;
};

// Hapus notif (opsional)
export const deleteNotification = async (id, clerkId) => {
  const { data: notif } = await supabase
    .from("notifications")
    .select("recipient_clerk_id")
    .eq("id", id)
    .single();
  if (!notif) throw new Error("Notifikasi tidak ditemukan");
  if (notif.recipient_clerk_id !== clerkId) throw new Error("Bukan notifikasi kamu");

  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};