//this is only for we writing import statement
// and not using require statement
import dotenv from "dotenv";
dotenv.config({path: './.env'});
// also for using this we write in package.json
//-r dotenv/config --experimentel-json-module for we using import statement

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    app.on('error', (err) => {
        console.error("Server error:", err);
    });
})
.catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
});