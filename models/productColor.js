import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ProductColor",
    {
      color_name: DataTypes.STRING,
      color_code: DataTypes.STRING,
      image_url: DataTypes.TEXT,
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    { timestamps: false }
  );
};
