import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Project from "./project.js";

const ProjectMember = sequelize.define("project_member", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  project_id: DataTypes.UUID,
  clerk_user_id: DataTypes.STRING,
  role: DataTypes.STRING,
  joined_at: DataTypes.STRING,
}, {
  tableName: "project_member",
  timestamps: false,
});

Project.hasMany(ProjectMember, { foreignKey: "project_id", onDelete: "CASCADE" });
ProjectMember.belongsTo(Project, { foreignKey: "project_id" });

export default ProjectMember;
