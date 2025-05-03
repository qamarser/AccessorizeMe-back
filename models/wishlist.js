import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { INTEGER, DATE } = DataTypes;

  return sequelize.define(
    "Wishlist",
    {
      user_id: { type: INTEGER, allowNull: false },
      product_id: { type: INTEGER, allowNull: false },
      added_at: { type: DATE, defaultValue: DATE.NOW },
    },
    { timestamps: false }
  );
};
