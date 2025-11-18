import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// modles
import Board from "./model/boardModel.js";
import Task from "./model/taskModle.js";
import User from "./model/userModel.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 2009;
const mongodbUrl = process.env.MONGODB_URL;

// Middleware
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "./views");
// token middle ware 
function auth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}

// Connect to MongoDB Atlas
mongoose.connect(mongodbUrl)
    .then(() => console.log("✅ Connected to MongoDB Atlas successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

//  ===========Boards Routes==========

// show boards
app.get("/boards", auth, async (req, res) => {
    try {
        const boards = await Board.find({ userId: req.user.userId });
        res.json(boards);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// add new boards    
app.post("/boards", auth, async (req, res) => {
    try {
        const { name } = req.body;
        // Validate
        if (!name) {
            return res.status(400).json({ error: "Board name is required" });
        }
        // create new board
        const newBoard = new Board({ name, userId: req.user.userId })
        const savedBoard = await newBoard.save();

        res.status(201).json(savedBoard);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete borads 
app.delete("/boards/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findById(id);
        if (!board) return res.status(404).json({ error: "Board not found" });

        if (board.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "You do not have permission to delete this board" });
        }

        await Board.findByIdAndDelete(id);
        res.json({ message: "Board deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ===========Task Routes=========

// show task 
app.get("/boards/:boardId/tasks", async (req, res) => {
    try {
        const { boardId } = req.params;
        const tasks = await Task.find({ boardId });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// add new task 
app.post("/boards/:boardId/tasks", async (req, res) => {
    try {
        const { title, status } = req.body;
        const newTask = new Task({ title, status, boardId: req.params.boardId });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// edit task 
app.put("/boards/:boardId/tasks/:taskId", async (req, res) => {
    try {
        const { title, status } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            { title, status },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete task 
app.delete("/boards/:boardId/tasks/:taskId", async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.taskId);
        if (!deletedTask) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json(deletedTask);
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ======user validation ======

// ===login ===
app.post("/login", async (req, res) => {
    try {
        const { userName, userEmail, password } = req.body;

        if (!userName || !userEmail || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ message: "Login successful", token });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// === signup ===

app.post("/signup", async (req, res) => {
    try {
        const { userName, userEmail, password } = req.body;

        if (!userName || !userEmail || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email: userEmail });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ userName, email: userEmail, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });

    } catch (err) {
        console.error("❌ Signup Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});