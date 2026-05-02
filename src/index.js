// src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  clerkIdInjectorWithLogging,
  performanceLogger,
} from "./middleware/index.js";

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
// CORS (Express 5 Safe)
// =====================================
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-clerk-user-id",
  ],
};

app.use(cors(corsOptions));

// Handle preflight manually (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-clerk-user-id"
    );

    return res.sendStatus(204);
  }

  next();
});

// =====================================
// BODY PARSER
// =====================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// LOGGER
// =====================================
app.use(performanceLogger);

// =====================================
// PUBLIC ROUTES
// =====================================
app.get("/", (req, res) => {
  res.send("Kanban API is running successfully!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
  });
});

app.use("/api/clerk-users", clerkRoutes);

// =====================================
// PRIVATE ROUTES (Need Token)
// =====================================
app.use(
  "/api/projects",
  clerkIdInjectorWithLogging,
  projectRoutes
);

app.use(
  "/api/project-members",
  clerkIdInjectorWithLogging,
  projectMemberRoutes
);

app.use(
  "/api/boards",
  clerkIdInjectorWithLogging,
  boardsRoutes
);

app.use(
  "/api/columns",
  clerkIdInjectorWithLogging,
  columnsRoutes
);

app.use(
  "/api/cards",
  clerkIdInjectorWithLogging,
  cardsRoutes
);

app.use(
  "/api/activity-logs",
  clerkIdInjectorWithLogging,
  activityLogRoutes
);

app.use(
  "/api/notification",
  clerkIdInjectorWithLogging,
  notificationsRoutes
);

app.use(
  "/api/comment",
  clerkIdInjectorWithLogging,
  commentsRoutes
);

app.use(
  "/api/report",
  clerkIdInjectorWithLogging,
  reportRoutes
);

app.use(
  "/api/owner",
  clerkIdInjectorWithLogging,
  ownerRoutes
);

// =====================================
// ERROR HANDLER
// =====================================
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// =====================================
// 404
// =====================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
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