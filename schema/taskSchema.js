import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: {
        type: String,
        enum: ["todo", "progress", "done"],
        default: "todo",
    },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    createdAt: { type: Date, default: Date.now },
})

export default taskSchema 