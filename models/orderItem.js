import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "OrderItem",
    {
      quantity: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2),
    },
    { timestamps: false }
  );
};
