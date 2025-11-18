import mongoose from "mongoose";
import userSchema from "../schema/userSchema.js";

const User = mongoose.model("User", userSchema);

export default User