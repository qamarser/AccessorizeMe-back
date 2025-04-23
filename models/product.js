import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Product",
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL(10, 2),
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_custom: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
};
