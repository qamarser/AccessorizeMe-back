"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("Carts", "product_color_id", {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "ProductColors",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("Carts", "product_color_id");
}
