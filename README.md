# SmartStore AI

SmartStore AI is a next-generation, premium e-commerce platform built entirely on the MERN stack (MongoDB, Express, React, Node.js). 
It goes beyond a traditional shopping application by integrating AI-powered product curation and descriptions, an extensive Admin dashboard for complete store management, and a highly polished, glassmorphic UI.

## 🚀 Key Features

### For Users
*   **Premium Shopping Experience:** A stunning, responsive UI built with Tailwind CSS, featuring glassmorphism, dynamic gradients, and micro-animations.
*   **Smart Storefront:** Products are organized seamlessly. The homepage highlights AI-curated picks, trending items, and best sellers.
*   **AI Product Insights:** A beautiful Quick View modal reveals rich, AI-generated product descriptions and SEO tags for informed purchasing.
*   **Global Shopping Cart:** A slide-over cart panel allows users to manage their items, adjust quantities, and preview their total in real-time.
*   **Account Management:** Secure user registration, login, and personalized user profiles.

### For Administrators
*   **Comprehensive Dashboard:** A powerful control center to monitor sales, revenue, and active users at a glance.
*   **Product Management:** Full CRUD capabilities for the store's inventory. Add, edit, and delete products easily.
*   **AI Content Generator:** A dedicated tool within the admin panel that generates compelling, SEO-optimized marketing copy and descriptions for products.
*   **Order Tracking:** View all recent sales, change order statuses (Pending, Processing, Shipped, Delivered), and manage fulfillment.
*   **User Management:** Oversee registered accounts and manage customer data.

---

## 🛠️ Technology Stack

**Frontend:**
*   React (Vite)
*   Tailwind CSS (Styling)
*   React Router (Navigation)
*   Lucide React (Icons)
*   Context API (State Management: Auth, Theme, Cart)

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose
*   JSON Web Tokens (JWT) for Authentication
*   Bcrypt.js for Password Hashing

---

## 📂 Project Structure

```text
mern/
├── backend/
│   ├── controllers/    # Route logic (auth, products, orders, ai)
│   ├── middleware/     # JWT protection & Admin checks
│   ├── models/         # Mongoose schemas (User, Product, Sale)
│   ├── routes/         # Express API routes
│   ├── seed.js         # Script to populate database with mock data
│   └── server.js       # Main backend entry point
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI pieces (Navbar, Sidebar, Modals, Cart)
    │   ├── context/    # Global State (AuthContext, CartContext, ThemeContext)
    │   ├── pages/      # Full views (Store, Dashboard, Orders, Login, etc.)
    │   └── services/   # API abstraction layer
    └── vite.config.js
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/) (Running locally or a MongoDB Atlas URI)

### 2. Backend Setup
Navigate into the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` folder and add the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartstore
JWT_SECRET=your_super_secret_jwt_key
```

Seed the database with sample data (Creates an Admin account, User account, Products, and Orders):
```bash
node seed.js
```
*(Default Admin: `admin@example.com` / `password123`)*

Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application will now be running. You can access the frontend at `http://localhost:5173` (or the port specified by Vite) and the backend API at `http://localhost:5000`.

---

## 📝 Available Scripts

### Backend (`/backend`)
*   `npm start`: Runs the server in production mode.
*   `npm run dev`: Runs the server using nodemon for automatic reloads.
*   `node seed.js`: Wipes the database and populates it with fresh mock data.

### Frontend (`/frontend`)
*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Builds the app for production.
*   `npm run preview`: Locally previews the production build.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License
This project is licensed under the MIT License.
