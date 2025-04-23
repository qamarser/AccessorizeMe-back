import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Image",
    {
      image_url: DataTypes.TEXT,
      alt_text: DataTypes.STRING,
related_type: {
  type: DataTypes.ENUM(
    "product",
    "category",
    "banner",
    "homepage",
    "custom_order",
    "productColor",
    "other"
  ),
  defaultValue: "other",
},
      related_id: DataTypes.INTEGER,
      uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
};
