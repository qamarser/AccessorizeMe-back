import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "StockLog",
    {
      change_type: {
        type: DataTypes.ENUM("manual_update", "sale", "restock", "return"),
      },
      quantity_changed: DataTypes.INTEGER,
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
