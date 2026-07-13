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

// =============================
//  KIRIM NOTIF KE "LAWAN" DARI YANG NGE-ACTION
//  - Kalau yang action PM        -> notif ke semua assigned member (card_members)
//  - Kalau yang action non-PM    -> notif ke semua PM di project itu
//  Dipakai buat comment & attachment di card yang sudah di-assign.
// =============================
export const notifyCardParticipants = async ({ card_id, project_id, actorClerkId, actorRole, type, message }) => {
  if (actorRole === "PM") {
    const { data: assignedMembers } = await supabase
      .from("card_members")
      .select("clerk_user_id")
      .eq("card_id", card_id);

    if (assignedMembers && assignedMembers.length > 0) {
      await Promise.all(
        assignedMembers.map((m) =>
          createNotification({
            recipient_clerk_id: m.clerk_user_id,
            sender_clerk_id: actorClerkId,
            type,
            message,
            card_id,
          })
        )
      );
    }
  } else {
    const { data: pmMembers } = await supabase
      .from("project_member")
      .select("clerk_user_id")
      .eq("project_id", project_id)
      .eq("role", "PM");

    if (pmMembers && pmMembers.length > 0) {
      await Promise.all(
        pmMembers.map((pm) =>
          createNotification({
            recipient_clerk_id: pm.clerk_user_id,
            sender_clerk_id: actorClerkId,
            type,
            message,
            card_id,
          })
        )
      );
    }
  }
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