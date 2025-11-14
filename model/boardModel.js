import mongoose from "mongoose";
import boardSchema from "../schema/boardSchema.js";

const Board = mongoose.model("Board", boardSchema);
                
export default Board