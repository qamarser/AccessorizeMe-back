import {
  Order,
  OrderItem,
  Product,
  Shipping,
  Payment,
  User,
} from "../config/db.js";

// Place an order (customer)
// Place an order (customer)
export const placeOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { shipping_id, items } = req.body;

    // 1. Auto-create Cash on Delivery payment
    const payment = await Payment.create({
      payment_method: "cash_on_delivery",
      status: "pending",
    });

    // 2. Create the order (without total_amount yet)
    const order = await Order.create({
      user_id,
      shipping_id,
      payment_id: payment.id,
      status: "pending",
    });

    // 3. Create order items
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findByPk(item.product_id);
        if (!product) throw new Error("Invalid product ID: " + item.product_id);

        return OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price,
        });
      })
    );

    // 4. Calculate total amount and update order
    const totalAmount = orderItems.reduce((sum, item) => {
       return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    // console.log("Total Amount:", totalAmount);
    //   console.log( " Order Items:", orderItems );
      
    await order.update({ total_amount: totalAmount });

    // Re-fetch order to ensure value is included in response
const updatedOrder = await Order.findByPk(order.id, {
  attributes: [
    "id",
    "total_amount",
    "status",
    "created_at",
    "shipping_id",
    "payment_id",
  ],
  include: [{ model: OrderItem, include: [Product] }, Shipping, Payment],
});

    //   console.log( "Updated Order:", updatedOrder.toJSON() );
      
    res.status(201).json({
      message: "Order placed successfully",
      order: updatedOrder,
      orderItems,
        totalAmount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error placing order", error: err.message });
  }
};


// Customer: View own orders
export const getCustomerOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    // const orders = await Order.findAll({
    //   where: { user_id },
    //   include: [{ model: OrderItem, include: [Product] }, Shipping, Payment],
    // });
    const orders = await Order.findAll({
    where: { user_id },
    attributes: [
        "id",
        "total_amount",
        "status",
        "created_at",
        "shipping_id",
        "payment_id",
    ],
    include: [{ model: OrderItem, include: [Product] }, Shipping, Payment],
    });

    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: err.message });
  }
};

// Admin: View all orders
export const getAllOrders = async (req, res) => {
    try
    {
      const orders = await Order.findAll({
        // where: { user_id },
        attributes: [
          "id",
          "total_amount",
          "status",
          "created_at",
          "shipping_id",
          "payment_id",
        ],
        include: [
          { model:  OrderItem, include: [Product] },
          Shipping,
          Payment,
        ],
      });

    // const orders = await Order.findAll({
    //   include: [
    //     { model: User, attributes: ["id", "name", "email"] },
    //     { model: OrderItem, include: [Product] },
    //     Shipping,
    //     Payment,
    //   ],
    // });
// const ordersWithTotal = orders.map((order) => {
//   const totalAmount = order.OrderItems.reduce((sum, item) => {
//     return sum + item.price * item.quantity;
//   }, 0);
//   return { ...order.toJSON(), totalAmount };
// });

// res.status(200).json(ordersWithTotal);

    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching all orders", error: err.message });
  }
};
