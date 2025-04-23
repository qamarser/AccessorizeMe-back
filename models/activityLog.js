import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ActivityLog",
    {
      action_type: {
        type: DataTypes.ENUM(
          "product_edit",
          "order_status_change",
          "stock_update",
          "user_update",
          "other"
        ),
      },
      description: DataTypes.TEXT,
      timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
