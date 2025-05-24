// config/sync.js
import sequelize from "./sequelize.js";
import "./db.js"; // load models and associations

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Creates tables if not present
    console.log(" All models were synchronized successfully.");
  } catch (error) {
    console.error(" Error syncing models with the database:", error);
  }
};

syncDatabase();
