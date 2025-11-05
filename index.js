import mongoose from "mongoose";
import express from "express";
import taskModel from "./model/taskModel.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 2009;
const mongodbUrl = process.env.MONGODB_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(mongodbUrl)
    .then(() => console.log("✅ Connected to MongoDB Atlas successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/tasks", async (req, res) => {
    try {
        res.send("fd");
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
