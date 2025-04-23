import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ProductTag",
    {
      tag_name: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
