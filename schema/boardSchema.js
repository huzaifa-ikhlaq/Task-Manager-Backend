import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

export default boardSchema;