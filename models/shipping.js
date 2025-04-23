import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Shipping",
    {
      full_name: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      postal_code: DataTypes.STRING,
      tracking_number: DataTypes.STRING,
      shipped_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
};
