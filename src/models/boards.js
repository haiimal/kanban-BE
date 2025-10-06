import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Project from "./project.js";

const Board = sequelize.define("boards", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  project_id: DataTypes.UUID,
  created_at: DataTypes.DATE,
}, {
  tableName: "boards",
  timestamps: false,
});

Project.hasMany(Board, { foreignKey: "project_id", onDelete: "CASCADE" });
Board.belongsTo(Project, { foreignKey: "project_id" });

export default Board;
