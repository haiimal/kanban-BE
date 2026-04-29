// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { clerkIdInjectorWithLogging, performanceLogger } from "./middleware/index.js";
import clerkRoutes from "./routes/clerkRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";
import boardsRoutes from "./routes/boardsRoutes.js";
import columnsRoutes from "./routes/columnsRoutes.js";
import cardsRoutes from "./routes/cardsRoutes.js";
import activityLogRoutes from "./routes/activitylogRoutes.js";
import notificationsRoutes from "./routes/notificationsRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";

const app = express();
const PORT = process.env.PORT || 3002;


// =====================================
// CORS — handle preflight SEBELUM semua middleware lain
// =====================================
const allowedOrigins = [
  "http://localhost:3000",
  "https://kanban-fe.vercel.app", // ganti dengan domain FE kamu di Vercel
];

const corsOptions = {
  origin: true, // Mengizinkan semua origin (otomatis memantulkan origin dari request)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-clerk-user-id"],
};

app.use(cors(corsOptions));

// =====================================
// GLOBAL MIDDLEWARE
// =====================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =====================================
// CLERK AUTH (token wajib)
// =====================================
app.use(clerkMiddleware());

// =====================================
// CUSTOM MIDDLEWARE
// =====================================
app.use(clerkIdInjectorWithLogging);
app.use(performanceLogger);

// =====================================
// ROUTES
// =====================================
app.get("/", (req, res) => {
  res.send("Kanban API is running successfully on Vercel!");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.use("/api/clerk-users", clerkRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-members", projectMemberRoutes);
app.use("/api/boards", boardsRoutes);
app.use("/api/columns", columnsRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/notification", notificationsRoutes);
app.use("/api/comment", commentsRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/owner", ownerRoutes);


// Middleware Error Handler
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS Not Allowed" });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});



// =====================================
// ERROR HANDLER
// =====================================
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// =====================================
// 404
// =====================================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// =====================================
// START SERVER
// =====================================
export default app;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}