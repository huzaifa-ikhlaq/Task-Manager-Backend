import mongoose from "mongoose";
import taskSchema from "../schema/taskSchema.js";

const Task = mongoose.model("Task", taskSchema);

export default Task