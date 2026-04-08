import supabase from "../config/database.js";

// Ambil log per card
export const getLogsByCard = async (card_id, clerkId) => {
  const { data: card } = await supabase.from("cards").select("columns_id").eq("id", card_id).single();
  if (!card) throw new Error("Card tidak ditemukan");

  const { data: column } = await supabase.from("columns").select("boards_id").eq("id", card.columns_id).single();
  const { data: board } = await supabase.from("boards").select("project_id").eq("id", column.boards_id).single();

  const { data: member } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();
  if (!member) throw new Error("Kamu bukan anggota project ini.");

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("card_id", card_id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return data;
};

// Ambil semua log per project
export const getLogsByProject = async (project_id, clerkId) => {
  const { data: member } = await supabase
    .from("project_member").select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();
  if (!member) throw new Error("Kamu bukan anggota project ini.");

  const { data: boards } = await supabase.from("boards").select("id").eq("project_id", project_id);
  if (!boards || boards.length === 0) return [];

  const boardIds = boards.map(b => b.id);

  const { data: columns } = await supabase.from("columns").select("id").in("boards_id", boardIds);
  const columnIds = columns && columns.length > 0 ? columns.map(c => c.id) : [];

  const { data: cards } = columnIds.length > 0
    ? await supabase.from("cards").select("id").in("columns_id", columnIds)
    : { data: [] };
  const cardIds = cards && cards.length > 0 ? cards.map(c => c.id) : [];

  // Ambil log dari card_id DAN project_id sekaligus
  let query = supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (cardIds.length > 0) {
    query = query.or(`card_id.in.(${cardIds.join(",")}),project_id.eq.${project_id}`);
  } else {
    query = query.eq("project_id", project_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data;
};