import { Shipping } from "../config/db.js";

// User creates shipping info
export const createShipping = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { full_name, phone, address, city, country, postal_code } = req.body;

    const shipping = await Shipping.create({
      user_id,
      full_name,
      phone,
      address,
      city,
      country,
      postal_code,
    });

    res.status(201).json({ message: "Shipping info saved", shipping });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error saving shipping info", error: err.message });
  }
};

//Admin can view all shippings
export const getAllShippings = async (req, res) => {
  try {
    const shippings = await Shipping.findAll();
    res.status(200).json(shippings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching shippings", error: err.message });
  }
};
