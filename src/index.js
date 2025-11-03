// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { clerkIdInjectorWithLogging, performanceLogger } from "./middleware/index.js";
import projectRoutes from "./routes/projectRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";
import boardsRoutes from "./routes/boardsRoutes.js";
import columnsRoutes from "./routes/columnsRoutes.js";
import cardsRoutes from "./routes/cardsRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3002;

// ===============================
// GLOBAL MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (Frontend lokal & Vercel)
app.use(
  cors({
    origin: [
      "http://localhost:3000", // dev lokal
      "https://kanban-fe.vercel.app", // domain frontend di Vercel
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-clerk-user-id"],
    credentials: true,
  })
);

// ===============================
// CLERK AUTHENTICATION
// ===============================
try {
  app.use(clerkMiddleware());
  console.log("Clerk middleware aktif");
} catch (err) {
  console.warn("Clerk middleware gagal di-load (dev mode):", err.message);
}

// ===============================
// CUSTOM MIDDLEWARE
// ===============================
app.use(clerkIdInjectorWithLogging); // inject Clerk ID dari token
app.use(performanceLogger); // log durasi request

// ===============================
// ROOT & HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("Kanban API is running successfully on Vercel!");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ===============================
// API ROUTES
// ===============================
app.use("/api/projects", projectRoutes);
app.use("/api/project-members", projectMemberRoutes);
app.use("/api/boards", boardsRoutes);
app.use("/api/columns", columnsRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/users", userRoutes);

// ===============================
// ERROR HANDLING
// ===============================
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

// 404 - Route Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===============================
// SERVER START
// ===============================
export default app;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
