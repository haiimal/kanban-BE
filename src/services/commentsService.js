import supabase from "../config/database.js";

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

export const getCommentsByCard = async (card_id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id").eq("id", card_id).single();
  if (!card) throw new Error("Card tidak ditemukan");
  await getUserRoleByColumn(card.columns_id, clerkId);

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("card_id", card_id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

export const createComment = async (card_id, content, clerkId) => {
  if (!content || content.trim() === "") throw new Error("Komentar tidak boleh kosong");

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
    .from("comments")
    .insert([{ card_id, clerk_user_id: clerkId, content: content.trim() }])
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data;
};

export const updateComment = async (id, content, clerkId) => {
  if (!content || content.trim() === "") throw new Error("Komentar tidak boleh kosong");

  const { data: comment } = await supabase
    .from("comments")
    .select("clerk_user_id")
    .eq("id", id)
    .single();
  if (!comment) throw new Error("Komentar tidak ditemukan");
  if (comment.clerk_user_id !== clerkId) throw new Error("Kamu hanya bisa edit komentar milik sendiri");

  const { data, error } = await supabase
    .from("comments")
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteComment = async (id, clerkId) => {
  const { data: comment } = await supabase
    .from("comments")
    .select("clerk_user_id, card_id")
    .eq("id", id)
    .single();
  if (!comment) throw new Error("Komentar tidak ditemukan");

  const { data: card } = await supabase.from("cards").select("columns_id").eq("id", comment.card_id).single();
  const role = await getUserRoleByColumn(card.columns_id, clerkId);

  // PM bisa hapus semua, member hanya milik sendiri
  if (role !== "PM" && comment.clerk_user_id !== clerkId) {
    throw new Error("Kamu hanya bisa menghapus komentar milik sendiri");
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};