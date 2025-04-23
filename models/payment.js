import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Payment",
    {
      payment_method: {
        type: DataTypes.ENUM("cash_on_delivery", "stripe", "wishmoney"),
        defaultValue: "cash_on_delivery",
      },
      status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      transaction_id: DataTypes.STRING,
      paid_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
};
