import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Project = sequelize.define("project", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  tableName: "project",
  timestamps: false,
});

export default Project;
