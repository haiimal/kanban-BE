// src/services/reportService.js
import supabase from "../config/database.js";

export const getProjectReport = async (project_id, clerkId) => {
  // Cek apakah user adalah member project
  const { data: member } = await supabase
    .from("project_member").select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();
  if (!member) throw new Error("Kamu bukan anggota project ini.");

  // =============================
  // DATA PROJECT
  // =============================
  const { data: project } = await supabase
    .from("project").select("*").eq("id", project_id).single();

  // =============================
  // DATA SEMUA MEMBER PROJECT
  // =============================
  const { data: members } = await supabase
    .from("project_member").select("clerk_user_id, role, joined_at")
    .eq("project_id", project_id);

  // =============================
  // DATA BOARDS
  // =============================
  const { data: boards } = await supabase
    .from("boards").select("id, name").eq("project_id", project_id);
  const boardIds = boards?.map(b => b.id) || [];

  // =============================
  // DATA COLUMNS
  // =============================
  const { data: columns } = boardIds.length > 0
    ? await supabase.from("columns").select("id, name, type").in("boards_id", boardIds)
    : { data: [] };
  const columnIds = columns?.map(c => c.id) || [];

  // =============================
  // DATA CARDS (lengkap dengan label & description)
  // =============================
  const { data: cards } = columnIds.length > 0
    ? await supabase
        .from("cards")
        .select("id, title, description, columns_id, progress, due_date, created_at")
        .in("columns_id", columnIds)
        .order("created_at", { ascending: true })
    : { data: [] };
  const cardIds = cards?.map(c => c.id) || [];

  // =============================
  // DATA CARD MEMBERS
  // =============================
  const { data: cardMembers } = cardIds.length > 0
    ? await supabase.from("card_members").select("card_id, clerk_user_id").in("card_id", cardIds)
    : { data: [] };

  // =============================
  // DATA KOMENTAR (untuk summary)
  // =============================
  const { data: comments } = cardIds.length > 0
    ? await supabase.from("comments").select("id, card_id").in("card_id", cardIds)
    : { data: [] };

  // =============================
  // DATA ATTACHMENT (untuk summary)
  // =============================
  const { data: attachments } = cardIds.length > 0
    ? await supabase.from("card_attachments").select("id, card_id").in("card_id", cardIds)
    : { data: [] };

  // =============================
  // BUAT MAP COLUMN: id → {name, type}
  // =============================
  const columnMap = {};
  columns?.forEach(c => { columnMap[c.id] = { name: c.name, type: c.type || "other" }; });

  // =============================
  // BREAKDOWN PER KOLOM
  // =============================
  const breakdown = columns?.map(col => ({
    column_id: col.id,
    column_name: col.name,
    type: col.type || "other",
    count: cards?.filter(c => c.columns_id === col.id).length || 0,
  })) || [];

  const total = cards?.length || 0;
  const done = breakdown
    .filter(col => col.type === "done")
    .reduce((s, col) => s + col.count, 0);
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  // =============================
  // STATUS PROJECT
  // =============================
  const now = new Date();
  const deadlineDate = project.deadline ? new Date(project.deadline) : null;
  let status = "On Going";
  if (percentage === 100) status = "Selesai";
  else if (deadlineDate && now > deadlineDate) status = "Terlambat";

  // =============================
  // DURASI PROJECT
  // =============================
  const startDate = new Date(project.created_at);
  const endDate = deadlineDate || now;
  const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // =============================
  // TASK DETAIL LENGKAP PER CARD
  // =============================
  const tasks = cards?.map(card => {
    const col = columnMap[card.columns_id] || { name: "Unknown", type: "other" };
    const assignees = cardMembers
      ?.filter(cm => cm.card_id === card.id)
      .map(cm => cm.clerk_user_id) || [];
    const cardComments = comments?.filter(c => c.card_id === card.id).length || 0;
    const cardAttachments = attachments?.filter(a => a.card_id === card.id).length || 0;
    const isOverdue = card.due_date && new Date(card.due_date) < now && col.type !== "done";

    return {
      id: card.id,
      title: card.title,
      description: card.description || null,
      column_name: col.name,
      column_type: col.type,
      progress: card.progress || 0,
      due_date: card.due_date || null,
      created_at: card.created_at,
      assignees,
      is_overdue: isOverdue,
      total_comments: cardComments,
      total_attachments: cardAttachments,
    };
  }) || [];

  // =============================
  // TASK PER MEMBER (lebih detail)
  // =============================
  const memberTaskMap = {};
  members.forEach(m => {
    memberTaskMap[m.clerk_user_id] = {
      tasks_assigned: 0,
      tasks_completed: 0,
      task_titles: [],
    };
  });

  cardMembers?.forEach(cm => {
    if (!memberTaskMap[cm.clerk_user_id]) return;
    const card = cards?.find(c => c.id === cm.card_id);
    if (!card) return;
    const col = columnMap[card.columns_id];
    memberTaskMap[cm.clerk_user_id].tasks_assigned++;
    memberTaskMap[cm.clerk_user_id].task_titles.push(card.title);
    if (col?.type === "done") {
      memberTaskMap[cm.clerk_user_id].tasks_completed++;
    }
  });

  // Member dengan task terbanyak
  const topMember = Object.entries(memberTaskMap)
    .sort((a, b) => b[1].tasks_assigned - a[1].tasks_assigned)[0];

  // =============================
  // SUMMARY AKTIVITAS
  // =============================
  const overdueTasks = tasks.filter(t => t.is_overdue).length;
  const totalComments = comments?.length || 0;
  const totalAttachments = attachments?.length || 0;

  // =============================
  // RETURN RESPONSE LENGKAP
  // =============================
  return {
    // Info project
    project: {
      id: project.id,
      name: project.name,
      description: project.description || null,
      start_date: project.created_at,
      deadline: project.deadline || null,
    },
    status,
    duration_days: durationDays,
    percentage,
    total_tasks: total,
    completed_tasks: done,

    // Member detail
    members: members.map(m => ({
      clerk_user_id: m.clerk_user_id,
      role: m.role,
      joined_at: m.joined_at,
      tasks_assigned: memberTaskMap[m.clerk_user_id]?.tasks_assigned || 0,
      tasks_completed: memberTaskMap[m.clerk_user_id]?.tasks_completed || 0,
      task_titles: memberTaskMap[m.clerk_user_id]?.task_titles || [],
    })),

    // Member paling produktif
    top_member: topMember
      ? { clerk_user_id: topMember[0], tasks: topMember[1].tasks_assigned }
      : null,

    // Daftar task lengkap
    tasks,

    // Breakdown per kolom
    breakdown,

    // Summary aktivitas
    summary: {
      total_comments: totalComments,
      total_attachments: totalAttachments,
      overdue_tasks: overdueTasks,
    },

    // Board info
    boards: boards?.map(b => ({ id: b.id, name: b.name })) || [],
  };
};