import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "LowStockAlert",
    {
      current_stock: DataTypes.INTEGER,
      threshold: { type: DataTypes.INTEGER, defaultValue: 5 },
      notified_at: DataTypes.DATE,
      resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { timestamps: false }
  );
};
