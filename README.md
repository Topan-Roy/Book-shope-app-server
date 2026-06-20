<h1 align="center">📚 Book Shop App — Server</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
</p>

<p align="center">
  একটি সম্পূর্ণ RESTful API Backend — Book Shop অ্যাপের জন্য।
  <br />
  JWT Authentication, MongoDB CRUD, Stripe Payment Integration সহ।
</p>

---

## 🌐 Live Server

> 🔗 **Base URL:** `https://book-shope-app-server.onrender.com`

---

## ✨ Features

- 🔐 **JWT Authentication** — Token-based secure API access
- 👤 **User Management** — Register, login, profile update
- 📖 **Books CRUD** — Add, fetch, delete books (Admin only for delete)
- 🛒 **Cart System** — Add, update quantity, remove cart items
- ❤️ **Wishlist** — Save favourite books
- 📦 **Orders** — Place orders, track status
- 💳 **Stripe Payment** — Secure payment intent creation
- 📩 **Contact Form** — Save user inquiries
- 🛡️ **Admin Panel APIs** — Manage users, orders, books

---

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v18+ | Runtime Environment |
| **Express.js** | ^5.1.0 | Web Framework |
| **MongoDB** | ^7.0.0 | Database Driver |
| **MongoDB Atlas** | Cloud | Cloud Database |
| **JWT (jsonwebtoken)** | ^9.0.3 | Authentication |
| **Stripe** | ^22.2.2 | Payment Gateway |
| **dotenv** | ^17.2.3 | Environment Variables |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing |

---

## 📁 Project Structure

```
Book-shope-app-server/
│
├── index.js          # Main server file (all routes & logic)
├── package.json      # Dependencies & scripts
├── .env              # Environment variables (not pushed to GitHub)
├── .gitignore        # Git ignored files
└── README.md         # Project documentation
```

---

## ⚙️ Environment Variables

`.env` ফাইলে নিচের variables সেট করুন:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

> ⚠️ **Important:** `.env` ফাইল কখনো GitHub-এ push করবেন না।

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas Account
- Stripe Account

### Installation

```bash
# 1. Repository clone করুন
git clone https://github.com/your-username/Book-shope-app-server.git

# 2. Directory-তে যান
cd Book-shope-app-server

# 3. Dependencies install করুন
npm install

# 4. .env ফাইল তৈরি করুন এবং variables সেট করুন
# (উপরের Environment Variables section দেখুন)

# 5. Development server চালু করুন
npm run dev
```

> ✅ Server চালু হলে দেখাবে: `🔥 Server Running on Port: 3000`

---

## 📜 Scripts

```bash
npm start       # Production server চালু (node index.js)
npm run dev     # Development server চালু (nodemon index.js)
```

---

## 📡 API Endpoints

### 🔑 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/jwt` | JWT token generate | ❌ |
| `POST` | `/register` | নতুন user register | ❌ |

### 👤 Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/users/:email` | User info by email | ❌ |
| `PATCH` | `/users/:email` | Profile update | 🔐 Token |
| `GET` | `/users` | সব users (Admin) | 🔐 Admin |
| `PATCH` | `/users/role/:id` | User role update | 🔐 Admin |

### 📚 Books

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/books` | সব books / category filter | ❌ |
| `POST` | `/books` | নতুন book add | ❌ |
| `DELETE` | `/books/:id` | Book delete | 🔐 Admin |

### 🛒 Cart

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/carts?email=` | User এর cart items | 🔐 Token |
| `POST` | `/carts` | Cart-এ item add | 🔐 Token |
| `PATCH` | `/carts/:id` | Item quantity update | 🔐 Token |
| `DELETE` | `/carts/:id` | Cart থেকে item remove | 🔐 Token |

### ❤️ Wishlist

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/wishlist?email=` | User এর wishlist | 🔐 Token |
| `POST` | `/wishlist` | Wishlist-এ add | 🔐 Token |
| `DELETE` | `/wishlist/:id` | Wishlist থেকে remove | 🔐 Token |

### 📦 Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/orders` | নতুন order place | 🔐 Token |
| `GET` | `/orders?email=` | User এর orders | 🔐 Token |
| `GET` | `/all-orders` | সব orders (Admin) | 🔐 Admin |
| `PATCH` | `/orders/status/:id` | Order status update | 🔐 Admin |

### 💳 Payment

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/create-payment-intent` | Stripe payment intent create | ❌ |

### 📩 Contact

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/contacts` | Contact message save | ❌ |

---

## 🔐 Authentication Flow

```
Client                          Server
  │                               │
  ├──── POST /jwt { email } ─────►│
  │◄─── { token } ────────────────┤
  │                               │
  ├──── GET /carts ───────────────►│
  │     Authorization: Bearer <token>
  │◄─── Cart Data ─────────────────┤
```

---

## 🗄️ Database Collections

| Collection | Description |
|---|---|
| `books` | সব book এর তথ্য |
| `users` | Registered users |
| `carts` | Shopping cart items |
| `orders` | Placed orders |
| `wishlist` | User wishlist |
| `contacts` | Contact form submissions |

---

## 🌍 Render Deployment Guide

### Step 1: GitHub-এ Push করুন
```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### Step 2: Render-এ New Web Service তৈরি করুন
- [render.com](https://render.com) → **New +** → **Web Service**
- GitHub repo connect করুন

### Step 3: Build Settings

| Field | Value |
|-------|-------|
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### Step 4: Environment Variables সেট করুন
Render Dashboard → **Environment** → নিচের সব variables add করুন:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `JWT_SECRET` | Your custom JWT secret |
| `CLIENT_URL` | আপনার frontend এর deployed URL |

### Step 5: MongoDB Atlas Network Access
- Atlas → **Network Access** → **Add IP Address** → `0.0.0.0/0` *(Allow from Anywhere)*

> ✅ Deploy সফল হলে আপনার server URL পাবেন — সেটা `CLIENT_URL` হিসেবে frontend-এ এবং Render-এ `CLIENT_URL` হিসেবে সেট করুন।

---

## 🤝 Contributing

```bash
# Fork করুন → Branch তৈরি করুন → Changes করুন → Pull Request পাঠান
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with ❤️ for Book Lovers
  <br/>
  <strong>Book Shop App Server</strong> © 2025
</p>
