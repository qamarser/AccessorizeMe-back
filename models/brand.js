import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Brand",
    {
      name: { type: DataTypes.STRING, unique: true },
      logo_url: DataTypes.TEXT,
      description: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
