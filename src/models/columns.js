import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Board from "./boards.js";

const Column = sequelize.define("columns", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  boards_id: DataTypes.UUID,
  name: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  tableName: "columns",
  timestamps: false,
});

Board.hasMany(Column, { foreignKey: "boards_id", onDelete: "CASCADE" });
Column.belongsTo(Board, { foreignKey: "boards_id" });

export default Column;
