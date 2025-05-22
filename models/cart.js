import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Cart",
    {
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      product_color_id: { type: DataTypes.INTEGER, allowNull: true }, 
    },
    { timestamps: false }
  );
};
