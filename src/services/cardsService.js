// src/services/cardsService.js
import supabase from "../config/database.js";
import { createNotification } from "./notificationsService.js";

// =============================
//  HELPER: ACTIVITY LOG
// =============================
const createActivityLog = async ({ card_id = null, project_id = null, clerk_user_id, action, description }) => {
  await supabase.from("activity_logs").insert([{
    card_id,
    project_id,
    clerk_user_id,
    action,
    description
  }]);
};

// =============================
//  HELPER: ROLE CHECK
// =============================
const getUserRoleByColumn = async (columns_id, clerkId) => {
  const { data: column } = await supabase.from("columns").select("boards_id").eq("id", columns_id).single();
  const { data: board } = await supabase.from("boards").select("project_id").eq("id", column.boards_id).single();
  const { data: member } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();

  if (!member) throw new Error("Kamu bukan anggota project ini.");
  return member.role;
};

// =============================
// GET CARDS BY COLUMN
// =============================
export const getCardsByColumn = async (columns_id, clerkId) => {
  await getUserRoleByColumn(columns_id, clerkId);
  const { data, error } = await supabase.from("cards").select("*").eq("columns_id", columns_id).order("created_at");
  if (error) throw new Error(error.message);
  return data;
};

// =============================
// CREATE CARD (PM)
// =============================
export const createCard = async (columns_id, title, description, due_date, clerkId) => {

  // ← TAMBAH validasi
  if (!title || !title.trim()) throw new Error("Judul task wajib diisi");

  const role = await getUserRoleByColumn(columns_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM");

  const { data, error } = await supabase
    .from("cards")
    .insert([{ columns_id, title, description, due_date, progress: 0 }])
    .select()
    .single();
  if (error) throw new Error(error.message);

  await createActivityLog({
    card_id: data.id,
    clerk_user_id: clerkId,
    action: "CREATE_CARD",
    description: `Menambahkan task baru "${title}"`,
  });
  return data;
};

// =============================
// UPDATE CARD
// =============================
export const updateCard = async (id, fields, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id, title").eq("id", id).single();
  const role = await getUserRoleByColumn(card.columns_id, clerkId);

  // ← TAMBAH: title tidak boleh dikosongkan
  if (fields.title !== undefined && !fields.title.trim()) {
    throw new Error("Judul task tidak boleh kosong");
  }

  if (fields.progress !== undefined && (fields.progress < 0 || fields.progress > 100)) throw new Error("Progress 0-100");

  if (role !== "PM") {
  const allowed = ["description", "columns_id", "progress"];
  if (!Object.keys(fields).every(k => allowed.includes(k))) throw new Error("Tidak diizinkan");

  // ← PINDAH ke sini: hanya berlaku untuk non-PM
  if (fields.columns_id !== undefined) {
    const { data: assigned } = await supabase
      .from("card_members")
      .select("id")
      .eq("card_id", id)
      .eq("clerk_user_id", clerkId)
      .maybeSingle();
    if (!assigned) throw new Error("Kamu tidak di-assign ke task ini, tidak bisa memindahkan");
  }
}

  // Ambil nama kolom asal dan tujuan kalau card digeser
  let fromColumnName = null;
  let toColumnName = null;
  if (fields.columns_id !== undefined) {
    const { data: fromCol } = await supabase.from("columns").select("name").eq("id", card.columns_id).single();
    const { data: toCol } = await supabase.from("columns").select("name, type").eq("id", fields.columns_id).single();
    fromColumnName = fromCol?.name || "kolom lama";
    toColumnName = toCol?.name || "kolom baru";

    // Auto-sync progress berdasarkan type kolom tujuan
    if (toCol?.type === "done") fields.progress = 100;
    else if (toCol?.type === "in_progress" && fields.progress === undefined) fields.progress = 50;
    else if (toCol?.type === "todo") fields.progress = 0;
  }

  const { data, error } = await supabase.from("cards").update(fields).eq("id", id).select().single();
  if (error) throw new Error(error.message);

  let desc = `Mengupdate task "${card.title}"`;
  if (fields.columns_id !== undefined) desc = `Memindahkan task "${card.title}" dari ${fromColumnName} ke ${toColumnName}`;
  if (fields.progress === 100 && fields.columns_id === undefined) desc = `Menyelesaikan task "${card.title}"`;
  if (fields.progress !== undefined && fields.progress > 0 && fields.progress < 100 && fields.columns_id === undefined) desc = `Mengupdate progress "${card.title}" ke ${fields.progress}%`;
  if (fields.progress === 0 && fields.columns_id === undefined) desc = `Mereset progress "${card.title}" ke 0%`;

  await createActivityLog({
    card_id: id,
    clerk_user_id: clerkId,
    action: "UPDATE_CARD",
    description: desc,
  });
  return data;
};

// =============================
// DELETE CARD (PM)
// =============================
export const deleteCard = async (id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id, title").eq("id", id).single();
  const role = await getUserRoleByColumn(card.columns_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM");

  await supabase.from("cards").delete().eq("id", id);
  await createActivityLog({
    card_id: id,
    clerk_user_id: clerkId,
    action: "DELETE_CARD",
    description: `Menghapus task "${card.title}"`,
  });
  return true;
};

// =============================
//  ATTACHMENTS
// =============================
export const getAttachments = async (card_id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id").eq("id", card_id).single();
  if (!card) throw new Error("Card tidak ditemukan");
  await getUserRoleByColumn(card.columns_id, clerkId);

  const { data, error } = await supabase
    .from("card_attachments")
    .select("*")
    .eq("card_id", card_id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Gagal mengambil attachments: " + error.message);
  return data;
};

export const uploadAttachment = async (card_id, file_url, file_name, clerkId) => {
  if (!file_url) throw new Error("file_url wajib diisi");
  if (!file_name) throw new Error("file_name wajib diisi");

  const { data: card } = await supabase.from("cards").select("columns_id, title").eq("id", card_id).single();
  if (!card) throw new Error("Card tidak ditemukan");
  const role = await getUserRoleByColumn(card.columns_id, clerkId);

  if (role !== "PM") {
    const { data: assigned } = await supabase
      .from("card_members")
      .select("id")
      .eq("card_id", card_id)
      .eq("clerk_user_id", clerkId)
      .maybeSingle();
    if (!assigned) throw new Error("Kamu tidak di-assign ke task ini");
  }

  const { data, error } = await supabase
    .from("card_attachments")
    .insert([{ card_id, file_url, file_name, uploaded_by: clerkId }])
    .select()
    .single();
  if (error) throw new Error("Gagal upload attachment: " + error.message);

  // ← Kirim notif ke semua member yang di-assign ke card ini
  const { data: assignedMembers } = await supabase
    .from("card_members").select("clerk_user_id").eq("card_id", card_id);

  if (assignedMembers && assignedMembers.length > 0) {
    await Promise.all(
      assignedMembers.map(m =>
        createNotification({
          recipient_clerk_id: m.clerk_user_id,
          sender_clerk_id: clerkId,
          type: "ATTACHMENT",
          message: `File "${file_name}" diupload ke task "${card.title}"`,
          card_id,
        })
      )
    );
  }

  await createActivityLog({
    card_id,
    clerk_user_id: clerkId,
    action: "UPLOAD_ATTACHMENT",
    description: `Mengupload file "${file_name}" ke task "${card.title}"`,
  });
  return data;
};

export const deleteAttachment = async (id, clerkId) => {
  const { data: file } = await supabase
    .from("card_attachments")
    .select("card_id, uploaded_by, file_name")
    .eq("id", id)
    .single();
  if (!file) throw new Error("Attachment tidak ditemukan");

  const { data: card } = await supabase.from("cards").select("columns_id, title").eq("id", file.card_id).single();
  if (!card) throw new Error("Card tidak ditemukan");

  const role = await getUserRoleByColumn(card.columns_id, clerkId);
  if (role !== "PM" && file.uploaded_by !== clerkId) {
    throw new Error("Kamu hanya bisa menghapus file yang kamu upload sendiri");
  }

  // BE hanya hapus dari DB — storage dihapus oleh FE
  const { error } = await supabase.from("card_attachments").delete().eq("id", id);
  if (error) throw new Error("Gagal menghapus attachment: " + error.message);

  await createActivityLog({
    card_id: file.card_id,
    clerk_user_id: clerkId,
    action: "DELETE_ATTACHMENT",
    description: `Menghapus file "${file.file_name}" dari task "${card.title}"`,
  });
  return true;
};

// =============================
//  ASSIGN / UNASSIGN USER
// =============================
export const assignUser = async (card_id, user_id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id, title").eq("id", card_id).single();
  const { data: column } = await supabase.from("columns").select("boards_id").eq("id", card.columns_id).single();
  const { data: board } = await supabase.from("boards").select("project_id").eq("id", column.boards_id).single();

  const role = await getUserRoleByColumn(card.columns_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM yang bisa assign user");

  const { data: targetMember } = await supabase
    .from("project_member").select("clerk_user_id")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", user_id)
    .maybeSingle();
  if (!targetMember) throw new Error("User tidak terdaftar sebagai member project ini");

  const { data: alreadyAssigned } = await supabase
    .from("card_members").select("id")
    .eq("card_id", card_id)
    .eq("clerk_user_id", user_id)
    .maybeSingle();
  if (alreadyAssigned) throw new Error("User sudah di-assign ke card ini");

  const { error } = await supabase
    .from("card_members")
    .insert([{ card_id, clerk_user_id: user_id, assigned_by: clerkId }]);
  if (error) throw new Error("Gagal assign user: " + error.message);

  // ← Kirim notifikasi ke user yang di-assign
  await createNotification({
    recipient_clerk_id: user_id,
    sender_clerk_id: clerkId,
    type: "ASSIGN",
    message: `Kamu ditugaskan ke task "${card.title}"`,
    card_id,
  });

  await createActivityLog({
    card_id,
    clerk_user_id: clerkId,
    action: "ASSIGN_USER",
    description: `Menugaskan anggota ke task "${card.title}"`,
  });
  return true;
};

export const unassignUser = async (card_id, user_id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id, title").eq("id", card_id).single();
  const { data: column } = await supabase.from("columns").select("boards_id").eq("id", card.columns_id).single();
  const { data: board } = await supabase.from("boards").select("project_id").eq("id", column.boards_id).single();

  const role = await getUserRoleByColumn(card.columns_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM yang bisa unassign user");

  const { data: targetMember } = await supabase
    .from("project_member")
    .select("clerk_user_id")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", user_id)
    .maybeSingle();
  if (!targetMember) throw new Error("User tidak terdaftar sebagai member project ini");

  const { data: assigned } = await supabase
    .from("card_members")
    .select("id")
    .eq("card_id", card_id)
    .eq("clerk_user_id", user_id)
    .maybeSingle();
  if (!assigned) throw new Error("User belum di-assign ke card ini");

  const { error } = await supabase
    .from("card_members")
    .delete()
    .eq("card_id", card_id)
    .eq("clerk_user_id", user_id);
  if (error) throw new Error("Gagal unassign user: " + error.message);

  await createActivityLog({
    card_id,
    clerk_user_id: clerkId,
    action: "UNASSIGN_USER",
    description: `Melepas penugasan anggota dari task "${card.title}"`,
  });
  return true;
};

// =============================
//  GET CARD MEMBERS
// =============================
export const getCardMembers = async (card_id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id").eq("id", card_id).single();
  await getUserRoleByColumn(card.columns_id, clerkId);

  const { data } = await supabase.from("card_members").select("*").eq("card_id", card_id);
  return data;
};

// =============================
//  PROJECT PROGRESS (%)
// =============================
export const getProjectProgress = async (project_id, clerkId) => {
  const { data: member } = await supabase
    .from("project_member").select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();
  if (!member) throw new Error("Kamu bukan anggota project ini.");

  const { data: boards } = await supabase.from("boards").select("id").eq("project_id", project_id);
  if (!boards || boards.length === 0) return { percentage: 0, total: 0, done: 0, breakdown: [] };

  const boardIds = boards.map(b => b.id);

  const { data: columns } = await supabase.from("columns").select("id, name, type").in("boards_id", boardIds);
  if (!columns || columns.length === 0) return { percentage: 0, total: 0, done: 0, breakdown: [] };

  const columnIds = columns.map(c => c.id);

  const { data: cards } = await supabase.from("cards").select("id, columns_id").in("columns_id", columnIds);
  if (!cards || cards.length === 0) return { percentage: 0, total: 0, done: 0, breakdown: [] };

  const total = cards.length;

  const breakdown = columns.map(col => ({
    column_id: col.id,
    column_name: col.name,
    type: col.type || "other",
    count: cards.filter(c => c.columns_id === col.id).length,
  }));

  const done = breakdown
    .filter(col => col.type === "done")
    .reduce((sum, col) => sum + col.count, 0);

  const percentage = Math.round((done / total) * 100);

  return { percentage, total, done, breakdown };
};