// import jwt from "jsonwebtoken";
// import User from "../models/user"; // Import User model

// // Middleware to check if the user has the required role
// const roleMiddleware = (requiredRole) => {
//   return async (req, res, next) => {
//     try {
//       // Get the token from the request header
//       const token = req.headers["authorization"]?.split(" ")[1]; // 'Bearer <token>'

//       if (!token) {
//         return res.status(403).json({ message: "Token is required" });
//       }

//       // Verify the token and decode it
//       const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key here
//       const userId = decoded.id; // Extract user ID from the decoded token

//       // Find the user in the database
//       const user = await User.findByPk(userId);
//       if (!user) return res.status(404).json({ message: "User not found" });

//       // Check if the user's role matches the required role
//       if (user.role !== requiredRole) {
//         return res
//           .status(403)
//           .json({ message: "You do not have the required role" });
//       }

//       // Proceed to the next middleware or route handler
//       next();
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//     }
//   };
// };

// export default roleMiddleware;
