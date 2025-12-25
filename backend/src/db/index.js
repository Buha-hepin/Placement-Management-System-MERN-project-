import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
  try {
    const conectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB connected successfully ${conectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error :", error);
    process.exit(1); // Exit the process with failure
  }
}

export default connectDB;