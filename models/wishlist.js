import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Wishlist",
    {
      added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
