// db.js

import sequelize from "./sequelize.js";
import defineUser from "../models/user.js";
import defineCategory from "../models/category.js";
import defineBrand from "../models/brand.js";
import defineProduct from "../models/product.js";
import defineProductVariant from "../models/productVariant.js";
import defineProductColor from "../models/productColor.js";
import defineImage from "../models/image.js";
import defineCart from "../models/cart.js";
import defineWishlist from "../models/wishlist.js";
import defineShipping from "../models/shipping.js";
import definePayment from "../models/payment.js";
import defineOrder from "../models/order.js";
import defineOrderItem from "../models/orderItem.js";
import defineReview from "../models/review.js";
import defineStockLog from "../models/stockLog.js";
import defineLowStockAlert from "../models/lowStockAlert.js";
import defineActivityLog from "../models/activityLog.js";
import defineProductTag from "../models/productTag.js";

// Initialize models
const User = defineUser(sequelize);
const Category = defineCategory(sequelize);
const Brand = defineBrand(sequelize);
const Product = defineProduct(sequelize);
const ProductVariant = defineProductVariant(sequelize);
const ProductColor = defineProductColor(sequelize);
const Image = defineImage(sequelize);
const Cart = defineCart(sequelize);
const Wishlist = defineWishlist(sequelize);
const Shipping = defineShipping(sequelize);
const Payment = definePayment(sequelize);
const Order = defineOrder(sequelize);
const OrderItem = defineOrderItem(sequelize);
const Review = defineReview(sequelize);
const StockLog = defineStockLog(sequelize);
const LowStockAlert = defineLowStockAlert(sequelize);
const ActivityLog = defineActivityLog(sequelize);
const ProductTag = defineProductTag(sequelize);

// Define associations

// USER RELATIONS
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Wishlist, { foreignKey: "user_id" });
Wishlist.belongsTo(User, { foreignKey: "user_id" });

// Add association between Wishlist and Product
Product.hasMany(Wishlist, { foreignKey: "product_id" });
Wishlist.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(ActivityLog, { foreignKey: "user_id" });
ActivityLog.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(StockLog, { foreignKey: "updated_by" });
StockLog.belongsTo(User, { foreignKey: "updated_by" });

User.hasOne(Image, { foreignKey: "user_id", as: "profileImage" });
Image.belongsTo(User, { foreignKey: "user_id" });

// CATEGORY & BRAND RELATIONS
Category.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });

Brand.hasMany(Product, { foreignKey: "brand_id" });
Product.belongsTo(Brand, { foreignKey: "brand_id" });

Brand.hasMany(Product, { foreignKey: "brand_id" });
Product.belongsTo(Brand, { foreignKey: "brand_id" });

// PRODUCT RELATIONS

// Product - ProductVariant
Product.hasMany(ProductVariant, { foreignKey: "product_id" });
ProductVariant.belongsTo(Product, { foreignKey: "product_id" });

// Product - ProductColor
Product.hasMany(ProductColor, { foreignKey: "product_id" });
ProductColor.belongsTo(Product, { foreignKey: "product_id" });

// Add association between ProductVariant and ProductColor
ProductVariant.belongsTo(ProductColor, { foreignKey: "product_color_id" });
ProductColor.hasMany(ProductVariant, { foreignKey: "product_color_id" });

ProductColor.hasMany(Image, {
  foreignKey: "related_id",
  constraints: false,
  scope: {
    related_type: "productColor",
  },
});

Image.belongsTo(ProductColor, {
  foreignKey: "related_id",
  constraints: false,
});

Product.hasMany(Image, {
  foreignKey: "related_id",
  constraints: false,
  scope: { related_type: "product" },
});
Image.belongsTo(Product, {
  foreignKey: "related_id",
  constraints: false,
});

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Review, { foreignKey: "product_id" });
Review.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(StockLog, { foreignKey: "product_id" });
StockLog.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(ProductTag, { foreignKey: "product_id" });
ProductTag.belongsTo(Product, { foreignKey: "product_id" });

  // CART <-> PRODUCT
  Product.hasMany(Cart, { foreignKey: "product_id" });
  Cart.belongsTo(Product, { foreignKey: "product_id" });

  // CART <-> PRODUCTVARIANT
  ProductVariant.hasMany(Cart, { foreignKey: "product_variant_id" });
  Cart.belongsTo(ProductVariant, { foreignKey: "product_variant_id" });

  // CART <-> PRODUCTCOLOR
  ProductColor.hasMany(Cart, { foreignKey: "product_color_id" });
  Cart.belongsTo(ProductColor, { foreignKey: "product_color_id" });

// Add missing association between Image and ProductVariant
ProductVariant.hasMany(Image, {
  foreignKey: "related_id",
  constraints: false,
  scope: {
    related_type: "productVariant",
  },
});
Image.belongsTo(ProductVariant, {
  foreignKey: "related_id",
  constraints: false,
});

// ORDER RELATIONS
Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Order.belongsTo(Shipping, { foreignKey: "shipping_id" });
Shipping.hasOne(Order, { foreignKey: "shipping_id" });

Order.belongsTo(Payment, { foreignKey: "payment_id" });
Payment.hasOne(Order, { foreignKey: "payment_id" });

// Export models
export {
  User,
  Category,
  Brand,
  Product,
  ProductVariant,
  ProductColor,
  Image,
  Cart,
  Wishlist,
  Shipping,
  Payment,
  Order,
  OrderItem,
  Review,
  StockLog,
  LowStockAlert,
  ActivityLog,
  ProductTag,
};

export { default as sequelize } from "./sequelize.js";
