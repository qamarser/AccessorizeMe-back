# AccessorizeMe Backend

## Project Description
AccessorizeMe Backend is a RESTful API server built with Express.js and Sequelize ORM, designed to support an e-commerce platform. It manages user authentication, product catalog, orders, cart, shipping, reviews, and more, with a MySQL database backend.

## Prerequisites
- Node.js (v14 or higher recommended)
- MySQL database

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AccessorizeMe-back
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following environment variables:

   ```
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   PORT=5000  # Optional, defaults to 5000 if not set
   ```

## Running the Backend

- For development with automatic restarts on file changes:
  ```bash
  npm run dev
  ```

- For production:
  ```bash
  npm start
  ```

The server will start and listen on the port specified in the `PORT` environment variable or default to 5000.

## API Overview

The backend exposes the following main API routes:

- **Authentication**
  - `POST /api/auth/signup` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/me` - Get current logged-in user (requires token)

- **Users**
  - `GET /api/users` - User management routes (admin access)

- **Categories**
  - `GET /api/categories` - List categories

- **Products**
  - `GET /api/products` - List all products
  - `GET /api/products/best-sellers` - List best selling products
  - `GET /api/products/:id` - Get product details
  - `POST /api/products` - Create product (admin only)
  - `PUT /api/products/:id` - Update product (admin only)
  - `DELETE /api/products/:id` - Delete product (admin only)

- **Cart**
  - Cart management routes under `/api/cart`

- **Orders**
  - Order management routes under `/api/orders`

- **Shipping**
  - Shipping related routes under `/api/shipping`

- **Reviews**
  - Product reviews under `/api/reviews`

- **Variants, Images, Product Colors, Wishlist**
  - Managed under `/api/variants`, `/api/images`, `/api/productcolors`, `/api/wishlist`

- **Sitemap**
  - `GET /sitemap.xml` - SEO sitemap generation

## Database

- Uses Sequelize ORM with MySQL database.
- Database connection configured via environment variables.
- To create and initialize the database, run the following commands before starting the server:
  ```bash
  node config/initdb.js
  node config/sync.js
  ```
- On server start, Sequelize syncs models with the database using `alter: true` to update schema.

## Folder Structure

```
AccessorizeMe-back/
├── config/            # Database and Sequelize configuration
├── controllers/       # Route handlers and business logic
├── middleware/        # Express middleware (auth, roles, uploads)
├── migrations/        # Database migration scripts
├── models/            # Sequelize models and associations
├── routes/            # Express route definitions
├── scripts/           # Utility scripts (e.g., audit cleanup)
├── uploads/           # Uploaded files storage
├── server.js          # Main server entry point
├── package.json       # Project metadata and scripts
└── README.md          # This file
```

## License
This project is licensed under the ISC License.

## Author
[Your Name Here]
