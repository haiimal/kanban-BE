// src/services/ownerService.js
import supabase from "../config/database.js";

// =============================================
// HELPER: hitung status project
// =============================================
const getProjectStatus = (percentage, deadline) => {
  if (percentage === 100) return "Selesai";
  if (deadline && new Date() > new Date(deadline)) return "Terlambat";
  return "On Going";
};

// =============================================
// 1. SUMMARY TAHUNAN
//    GET /api/owner/summary
//    Mengembalikan jumlah project per tahun + total keseluruhan
// =============================================
export const getYearlySummary = async () => {
  // Ambil semua project
  const { data: projects, error } = await supabase
    .from("project")
    .select("id, name, deadline, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error("Gagal mengambil data project: " + error.message);
  if (!projects || projects.length === 0) {
    return { total_projects: 0, years: [] };
  }

  const projectIds = projects.map((p) => p.id);

  // Ambil semua columns untuk hitung progress
  const { data: boards } = await supabase
    .from("boards")
    .select("id, project_id")
    .in("project_id", projectIds);

  const boardIds = boards?.map((b) => b.id) || [];

  const { data: columns } = boardIds.length > 0
    ? await supabase.from("columns").select("id, boards_id, type").in("boards_id", boardIds)
    : { data: [] };

  const columnIds = columns?.map((c) => c.id) || [];

  const { data: cards } = columnIds.length > 0
    ? await supabase.from("cards").select("id, columns_id").in("columns_id", columnIds)
    : { data: [] };

  // Map: project_id -> { total, done }
  const boardProjectMap = {};
  boards?.forEach((b) => { boardProjectMap[b.id] = b.project_id; });

  const columnBoardMap = {};
  columns?.forEach((c) => { columnBoardMap[c.id] = c.boards_id; });

  const columnTypeMap = {};
  columns?.forEach((c) => { columnTypeMap[c.id] = c.type || "other"; });

  const projectTaskMap = {};
  projectIds.forEach((id) => { projectTaskMap[id] = { total: 0, done: 0 }; });

  cards?.forEach((card) => {
    const boardId = columnBoardMap[card.columns_id];
    const projectId = boardProjectMap[boardId];
    if (!projectId || !projectTaskMap[projectId]) return;
    projectTaskMap[projectId].total++;
    if (columnTypeMap[card.columns_id] === "done") {
      projectTaskMap[projectId].done++;
    }
  });

  // Kelompokkan per tahun
  const yearMap = {};
  projects.forEach((p) => {
    const year = new Date(p.created_at).getFullYear();
    if (!yearMap[year]) {
      yearMap[year] = { year, total: 0, selesai: 0, on_going: 0, terlambat: 0 };
    }
    const { total, done } = projectTaskMap[p.id] || { total: 0, done: 0 };
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    const status = getProjectStatus(percentage, p.deadline);

    yearMap[year].total++;
    if (status === "Selesai") yearMap[year].selesai++;
    else if (status === "Terlambat") yearMap[year].terlambat++;
    else yearMap[year].on_going++;
  });

  const years = Object.values(yearMap).sort((a, b) => a.year - b.year);

  return {
    total_projects: projects.length,
    total_selesai: years.reduce((s, y) => s + y.selesai, 0),
    total_on_going: years.reduce((s, y) => s + y.on_going, 0),
    total_terlambat: years.reduce((s, y) => s + y.terlambat, 0),
    years,
  };
};

// =============================================
// 2. LIST PROJECT PER TAHUN
//    GET /api/owner/projects?year=2026
// =============================================
export const getProjectsByYear = async (year) => {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data: projects, error } = await supabase
    .from("project")
    .select("id, name, description, deadline, created_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Gagal mengambil project: " + error.message);
  if (!projects || projects.length === 0) return { year: Number(year), projects: [] };

  const projectIds = projects.map((p) => p.id);

  // Hitung progress tiap project
  const { data: boards } = await supabase
    .from("boards").select("id, project_id").in("project_id", projectIds);

  const boardIds = boards?.map((b) => b.id) || [];

  const { data: columns } = boardIds.length > 0
    ? await supabase.from("columns").select("id, boards_id, type").in("boards_id", boardIds)
    : { data: [] };

  const columnIds = columns?.map((c) => c.id) || [];

  const { data: cards } = columnIds.length > 0
    ? await supabase.from("cards").select("id, columns_id, due_date").in("columns_id", columnIds)
    : { data: [] };

  const boardProjectMap = {};
  boards?.forEach((b) => { boardProjectMap[b.id] = b.project_id; });

  const columnBoardMap = {};
  columns?.forEach((c) => { columnBoardMap[c.id] = c.boards_id; });

  const columnTypeMap = {};
  columns?.forEach((c) => { columnTypeMap[c.id] = c.type || "other"; });

  const projectTaskMap = {};
  projectIds.forEach((id) => { projectTaskMap[id] = { total: 0, done: 0 }; });

  cards?.forEach((card) => {
    const boardId = columnBoardMap[card.columns_id];
    const projectId = boardProjectMap[boardId];
    if (!projectId || !projectTaskMap[projectId]) return;
    projectTaskMap[projectId].total++;
    if (columnTypeMap[card.columns_id] === "done") {
      projectTaskMap[projectId].done++;
    }
  });

  // Ambil jumlah member tiap project
  const { data: members } = await supabase
    .from("project_member").select("project_id, clerk_user_id").in("project_id", projectIds);

  const memberCountMap = {};
  projectIds.forEach((id) => { memberCountMap[id] = 0; });
  members?.forEach((m) => { memberCountMap[m.project_id]++; });

  const now = new Date();
  const result = projects.map((p) => {
    const { total, done } = projectTaskMap[p.id] || { total: 0, done: 0 };
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    const status = getProjectStatus(percentage, p.deadline);

    return {
      id: p.id,
      name: p.name,
      description: p.description || null,
      deadline: p.deadline || null,
      created_at: p.created_at,
      status,
      percentage,
      total_tasks: total,
      completed_tasks: done,
      total_members: memberCountMap[p.id] || 0,
    };
  });

  return { year: Number(year), total: result.length, projects: result };
};

// =============================================
// 3. LAPORAN DETAIL SATU PROJECT (owner version)
//    GET /api/owner/report/:project_id
//    Sama dengan reportService tapi tanpa cek membership
// =============================================
export const getOwnerProjectReport = async (project_id) => {
  const { data: project, error: projErr } = await supabase
    .from("project").select("*").eq("id", project_id).single();

  if (projErr || !project) throw new Error("Project tidak ditemukan.");

  // Members
  const { data: members } = await supabase
    .from("project_member").select("clerk_user_id, role, joined_at")
    .eq("project_id", project_id);

  // Boards
  const { data: boards } = await supabase
    .from("boards").select("id, name").eq("project_id", project_id);

  const boardIds = boards?.map((b) => b.id) || [];

  // Columns
  const { data: columns } = boardIds.length > 0
    ? await supabase.from("columns").select("id, name, type").in("boards_id", boardIds)
    : { data: [] };

  const columnIds = columns?.map((c) => c.id) || [];

  // Cards — tidak ada kolom label di DB
  const { data: cards } = columnIds.length > 0
    ? await supabase
        .from("cards")
        .select("id, title, description, columns_id, progress, due_date, created_at")
        .in("columns_id", columnIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const cardIds = cards?.map((c) => c.id) || [];

  // Card members, comments, attachments
  const [{ data: cardMembers }, { data: comments }, { data: attachments }] = await Promise.all([
    cardIds.length > 0
      ? supabase.from("card_members").select("card_id, clerk_user_id").in("card_id", cardIds)
      : Promise.resolve({ data: [] }),
    cardIds.length > 0
      ? supabase.from("comments").select("id, card_id").in("card_id", cardIds)
      : Promise.resolve({ data: [] }),
    cardIds.length > 0
      ? supabase.from("card_attachments").select("id, card_id").in("card_id", cardIds)
      : Promise.resolve({ data: [] }),
  ]);

  // Maps
  const columnMap = {};
  columns?.forEach((c) => { columnMap[c.id] = { name: c.name, type: c.type || "other" }; });

  // Breakdown per kolom
  const breakdown = columns?.map((col) => ({
    column_id: col.id,
    column_name: col.name,
    type: col.type || "other",
    count: cards?.filter((c) => c.columns_id === col.id).length || 0,
  })) || [];

  const total = cards?.length || 0;
  const done = breakdown
    .filter((col) => col.type === "done")
    .reduce((s, col) => s + col.count, 0);
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  const now = new Date();
  const status = getProjectStatus(percentage, project.deadline);

  const startDate = new Date(project.created_at);
  const endDate = project.deadline ? new Date(project.deadline) : now;
  const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Tasks detail
  const tasks = cards?.map((card) => {
    const col = columnMap[card.columns_id] || { name: "Unknown", type: "other" };
    const assignees = cardMembers?.filter((cm) => cm.card_id === card.id).map((cm) => cm.clerk_user_id) || [];
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
      total_comments: comments?.filter((c) => c.card_id === card.id).length || 0,
      total_attachments: attachments?.filter((a) => a.card_id === card.id).length || 0,
    };
  }) || [];

  // Member task stats
  const memberTaskMap = {};
  members?.forEach((m) => {
    memberTaskMap[m.clerk_user_id] = { tasks_assigned: 0, tasks_completed: 0, task_titles: [] };
  });

  cardMembers?.forEach((cm) => {
    if (!memberTaskMap[cm.clerk_user_id]) return;
    const card = cards?.find((c) => c.id === cm.card_id);
    if (!card) return;
    const col = columnMap[card.columns_id];
    memberTaskMap[cm.clerk_user_id].tasks_assigned++;
    memberTaskMap[cm.clerk_user_id].task_titles.push(card.title);
    if (col?.type === "done") memberTaskMap[cm.clerk_user_id].tasks_completed++;
  });

  const topMember = Object.entries(memberTaskMap)
    .sort((a, b) => b[1].tasks_assigned - a[1].tasks_assigned)[0];

  const overdueTasks = tasks.filter((t) => t.is_overdue).length;

  return {
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
    members: members?.map((m) => ({
      clerk_user_id: m.clerk_user_id,
      role: m.role,
      joined_at: m.joined_at,
      tasks_assigned: memberTaskMap[m.clerk_user_id]?.tasks_assigned || 0,
      tasks_completed: memberTaskMap[m.clerk_user_id]?.tasks_completed || 0,
      task_titles: memberTaskMap[m.clerk_user_id]?.task_titles || [],
    })) || [],
    top_member: topMember
      ? { clerk_user_id: topMember[0], tasks: topMember[1].tasks_assigned }
      : null,
    tasks,
    breakdown,
    summary: {
      total_comments: comments?.length || 0,
      total_attachments: attachments?.length || 0,
      overdue_tasks: overdueTasks,
    },
    boards: boards?.map((b) => ({ id: b.id, name: b.name })) || [],
  };
};