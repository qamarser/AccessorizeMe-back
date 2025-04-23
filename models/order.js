import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Order",
    {
      total_amount: DataTypes.DECIMAL(10, 2),
      status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered", "canceled"),
        defaultValue: "pending",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
