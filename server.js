import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { sequelize } from "./config/db.js";  // Added import for sequelize

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRouter.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import reviewRoutes from "./routes/reviewRouter.js";
import variantRoutes from "./routes/variantRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import productColorRoutes from "./routes/productColorRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
// Middleware to parse JSON bodies
app.use(express.json());

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON payload", error: err.message });
  }
  next();
});


// API Routes
app.use("/api/auth", authRoutes);
app.use( "/api/users", userRoutes );
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use( "/api/cart", cartRoutes );
app.use( "/api/orders", orderRoutes );
app.use( "/api/shipping", shippingRoutes );
app.use("/api/reviews", reviewRoutes);
app.use( "/api/variants", variantRoutes );
app.use("/api/images", imageRoutes);
app.use( "/api/productcolors", productColorRoutes );
app.use("/api/wishlist", wishlistRoutes);

app.use("/", sitemapRoutes);

// Sync database and start server
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

export default app;
