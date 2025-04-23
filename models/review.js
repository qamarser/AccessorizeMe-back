import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Review",
    {
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
