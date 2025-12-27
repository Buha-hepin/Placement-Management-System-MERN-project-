import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express()

const allowedOrigins = ["http://localhost:5173", "http://localhost:8000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);  
app.use(express.json());


const PORT = process.env.PORT || 8000;
     
    
//configure express to parse JSON and URL-encoded data
app.use(express.json({limit: '50mb' }));
app.use(express.urlencoded({ extended: true , limit: '50mb'}));
app.use(express.static('public'));
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


//routes import
import userRouter from "./routes/user.routes.js"


//routes declaration
app.use("/api/v1/users", userRouter)

    
   
export {app}