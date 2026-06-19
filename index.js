const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ========================
// JWT API & Middlewares
// ========================

app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.send({ token });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// MongoDB Connection
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("book-Shope-AppDB");
    const booksCollection = db.collection("books");
    const usersCollection = db.collection("users");
    const cartsCollection = db.collection("carts");
    const contactsCollection = db.collection("contacts");
    const ordersCollection = db.collection("orders");
    const wishlistCollection = db.collection("wishlist");

    // Middlewares for admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // POST contact message
    app.post("/contacts", async (req, res) => {
      try {
        const contact = req.body;
        contact.createdAt = new Date();
        const result = await contactsCollection.insertOne(contact);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error saving contact inquiry:", error);
        res.status(500).send({ success: false, message: "Server Error", error });
      }
    });

    app.post("/register", async (req, res) => {
      try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
          return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check duplicate email
        const isExist = await usersCollection.findOne({ email });
        if (isExist) {
          return res.status(409).json({ success: false, message: "Email already exists" });
        }

        // Create new user object
        const newUser = {
          name,
          email,

          role: "user",
          createdAt: new Date(),
        };

        // Insert user
        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({ success: true, message: "User registered successfully", userId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
    });

    // GET user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ADD Book
    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    // GET Books (All + Filter by category)
    app.get("/books", async (req, res) => {
      try {
        const category = req.query.category;
        let query = {};

        if (category) {
          query.category = { $regex: category, $options: "i" };
        }

        const result = await booksCollection.find(query).toArray();
        res.send(result);

      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server Error", error });
      }
    });

    // Carts Collection APIs
    app.post("/carts", verifyToken, async (req, res) => {
      const item = req.body;
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    });

    app.get("/carts", verifyToken, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send([]);
      }
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // UPDATE cart item quantity
    app.patch("/carts/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const { quantity } = req.body;
        const result = await cartsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { quantity: quantity } }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error updating quantity", error: err });
      }
    });

    // DELETE cart item
    app.delete("/carts/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await cartsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error deleting item", error: err });
      }
    });




    // ========================
    // ORDERS Collection APIs
    // ========================

    // POST - Save a new order after successful payment
    app.post("/orders", verifyToken, async (req, res) => {
      try {
        const order = req.body;
        order.createdAt = new Date();
        order.status = order.status || "Processing";
        const result = await ordersCollection.insertOne(order);
        res.status(201).json({ success: true, orderId: result.insertedId });
      } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // GET - Fetch all orders for a user by email
    app.get("/orders", verifyToken, async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.send([]);
        const result = await ordersCollection
          .find({ email })
          .sort({ createdAt: -1 })
          .toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // ========================
    // WISHLIST Collection APIs
    // ========================

    // POST - Add a book to wishlist (prevent duplicates)
    app.post("/wishlist", verifyToken, async (req, res) => {
      try {
        const item = req.body; // { email, bookId, title, author, price, img }
        const existing = await wishlistCollection.findOne({
          email: item.email,
          bookId: item.bookId,
        });
        if (existing) {
          return res.status(409).json({ success: false, message: "Already in wishlist" });
        }
        item.addedAt = new Date();
        const result = await wishlistCollection.insertOne(item);
        res.status(201).json({ success: true, id: result.insertedId });
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // GET - Fetch wishlist by user email
    app.get("/wishlist", verifyToken, async (req, res) => {
      try {
        const email = req.query.email;
        if (!email) return res.send([]);
        const result = await wishlistCollection
          .find({ email })
          .sort({ addedAt: -1 })
          .toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // DELETE - Remove from wishlist by id
    app.delete("/wishlist/:id", verifyToken, async (req, res) => {
      try {
        const result = await wishlistCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // GET all users (Admin only)
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const result = await usersCollection.find({}).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // UPDATE user role (Admin only)
    app.patch("/users/role/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const { role } = req.body;
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { role } }
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // ========================
    // USERS - Update profile
    // ========================
    app.patch("/users/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const updates = req.body; // { name, photoURL }
        const result = await usersCollection.updateOne(
          { email },
          { $set: { ...updates, updatedAt: new Date() } }
        );
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // GET all orders (Admin only)
    app.get("/all-orders", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const result = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // UPDATE order status (Admin only)
    app.patch("/orders/status/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
      }
    });

    // DELETE Book (Admin only)
    app.delete("/books/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error deleting item", error: err });
      }
    });

    // Stripe Payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body; // amount in BDT (taka)
        if (!amount || amount <= 0) {
          return res.status(400).json({ error: "Invalid amount" });
        }
        // Stripe uses smallest currency unit (paisa = 1/100 taka)
        // USD is used since BDT not supported; convert approx: 1 USD ≈ 110 BDT
        const amountInCents = Math.round((amount / 110) * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (err) {
        console.error("Stripe error:", err);
        res.status(500).json({ error: err.message });
      }
    });

    // Test Route
    app.get("/", (req, res) => {
      res.send("Book Shop Server Running");
    });



    await client.db("admin").command({ ping: 1 });
    console.log("🚀 MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
  }
}
run().catch(console.dir);

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`🔥 Server Running on Port: ${process.env.PORT}`);
});
