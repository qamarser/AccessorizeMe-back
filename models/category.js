import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Category",
    {
      name: { type: DataTypes.STRING, unique: true },
      background_image_url: DataTypes.TEXT,
    },
    { timestamps: false }
  );
};
