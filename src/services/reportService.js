import supabase from "../config/database.js";

export const getProjectReport = async (project_id, clerkId) => {
  const { data: member } = await supabase
    .from("project_member").select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();
  if (!member) throw new Error("Kamu bukan anggota project ini.");

  // Data project
  const { data: project } = await supabase
    .from("project").select("*").eq("id", project_id).single();

  // Data semua member
  const { data: members } = await supabase
    .from("project_member").select("clerk_user_id, role, joined_at")
    .eq("project_id", project_id);

  // Data boards
  const { data: boards } = await supabase
    .from("boards").select("id, name").eq("project_id", project_id);
  const boardIds = boards?.map(b => b.id) || [];

  // Data columns
  const { data: columns } = boardIds.length > 0
    ? await supabase.from("columns").select("id, name, type").in("boards_id", boardIds)
    : { data: [] };
  const columnIds = columns?.map(c => c.id) || [];

  // Data cards
  const { data: cards } = columnIds.length > 0
    ? await supabase.from("cards").select("id, title, columns_id, progress, due_date, created_at").in("columns_id", columnIds)
    : { data: [] };
  const cardIds = cards?.map(c => c.id) || [];

  // Data card members (siapa mengerjakan task apa)
  const { data: cardMembers } = cardIds.length > 0
    ? await supabase.from("card_members").select("card_id, clerk_user_id").in("card_id", cardIds)
    : { data: [] };

  // Hitung task per member
  const taskPerMember = {};
  members.forEach(m => { taskPerMember[m.clerk_user_id] = 0; });
  cardMembers?.forEach(cm => {
    if (taskPerMember[cm.clerk_user_id] !== undefined) {
      taskPerMember[cm.clerk_user_id]++;
    }
  });

  // Breakdown per kolom
  const breakdown = columns?.map(col => ({
    column_id: col.id,
    column_name: col.name,
    type: col.type || "other",
    count: cards?.filter(c => c.columns_id === col.id).length || 0,
  })) || [];

  const total = cards?.length || 0;
  const done = breakdown.filter(col => col.type === "done").reduce((s, col) => s + col.count, 0);
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  // Durasi project
  const startDate = new Date(project.created_at);
  const endDate = project.deadline ? new Date(project.deadline) : new Date();
  const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Member dengan task terbanyak
  const topMember = Object.entries(taskPerMember).sort((a, b) => b[1] - a[1])[0];

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      created_at: project.created_at,
      deadline: project.deadline || null,
    },
    duration_days: durationDays,
    percentage,
    total_tasks: total,
    completed_tasks: done,
    members: members.map(m => ({
      clerk_user_id: m.clerk_user_id,
      role: m.role,
      joined_at: m.joined_at,
      tasks_assigned: taskPerMember[m.clerk_user_id] || 0,
    })),
    top_member: topMember ? { clerk_user_id: topMember[0], tasks: topMember[1] } : null,
    breakdown,
    boards: boards?.map(b => ({ id: b.id, name: b.name })) || [],
  };
};