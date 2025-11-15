const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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






    // Test Route
    app.get("/", (req, res) => {
      res.send("Book Shop Server Running");
    });

    // ADD Book
    app.post("/books", async (req, res) => {
      const data = req.body;
      const result = await booksCollection.insertOne(data);
      res.send(result);
    });

    // GET all Books
    app.get("/books", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
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
