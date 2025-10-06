import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Column from "./columns.js";

const Card = sequelize.define("cards", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  columns_id: DataTypes.UUID,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  due_date: DataTypes.DATE,
  created_at: DataTypes.DATE,
}, {
  tableName: "cards",
  timestamps: false,
});

Column.hasMany(Card, { foreignKey: "columns_id", onDelete: "CASCADE" });
Card.belongsTo(Column, { foreignKey: "columns_id" });

export default Card;
