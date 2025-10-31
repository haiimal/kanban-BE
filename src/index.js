import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import projectRoutes from "./routes/projectRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";
import boardsRoutes from "./routes/boardsRoutes.js";
import columnsRoutes from "./routes/columnsRoutes.js";
import cardsRoutes from "./routes/cardsRoutes.js";
import { clerkIdInjectorWithLogging, performanceLogger } from "./middleware/index.js";

const app = express();
const PORT = process.env.PORT || 3002;

// ===============================
// GLOBAL MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ===============================
// Clerk Authentication Middleware
// (harus di atas semua route)
// ===============================
try {
app.use(clerkMiddleware());
console.log("✅ Clerk middleware aktif");
} catch (err) {
console.warn(" Clerk middleware gagal di-load (dev mode):", err.message);
}

// ===============================
// Custom Middleware
// ===============================
app.use(clerkIdInjectorWithLogging); // inject Clerk ID dari token
app.use(performanceLogger); // log waktu request

// ===============================
// Health Check & Root Route
// ===============================
app.get("/", (req, res) => {
res.send("Kanban API is running successfully on Vercel!");
});

app.get("/health", (req, res) => {
res.json({ status: "OK", message: "Server is running" });
});

// ===============================
// API ROUTES
// Prefix semua routes dengan /api
// ===============================
app.use("/api/projects", projectRoutes);
app.use("/api/project-members", projectMemberRoutes);
app.use("/api/boards", boardsRoutes);
app.use("/api/columns", columnsRoutes);
app.use("/api/cards", cardsRoutes);

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

// 404 handler (route tidak ditemukan)
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