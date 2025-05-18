import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ProductVariant",
    {
      variant_name: DataTypes.STRING,
      variant_value: DataTypes.STRING,
      additional_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      product_color_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // or false if required
      },
    },
    { timestamps: false }
  );
};
