import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import Board from "./model/boardModel.js";
import Task from "./model/taskModle.js";

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

//  ===========Boards Routes==========

// show boards
app.get("/boards", async (req, res) => {
    try {
        const boards = await Board.find();
        res.json(boards);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// add new boards    
app.post("/boards", async (req, res) => {
    try {
        const { name } = req.body;
        // Validate
        if (!name) {
            return res.status(400).json({ error: "Board name is required" });
        }
        // create new board
        const newBoard = new Board({ name })
        const savedBoard = await newBoard.save();

        res.status(201).json(savedBoard);
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// delete borads 
app.delete("/boards/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBoard = await Board.findByIdAndDelete(id);
        if (!deletedBoard) {
            return res.status(404).json({ error: "Board not found" });
        }
        res.json(deletedBoard);
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


// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});