import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express()

// Helper: Check if origin is a private/local IP
const isPrivateOrigin = (origin) => {
  try {
    const url = new URL(origin);
    const host = url.hostname;
    // Check for localhost/loopback
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    // Check for private IP ranges: 10.x.x.x, 192.168.x.x, 172.16-31.x.x
    if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) return true;
    return false;
  } catch {
    return false;
  }
};

// Allowed frontend origins for CORS
const rawCorsOrigins = String(process.env.CORS_ORIGIN || '').trim();
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8000',
  'https://placement-management-system-mern-pr.vercel.app',
];
const allowedOrigins = rawCorsOrigins === '*'
  ? '*'
  : (rawCorsOrigins
      ? rawCorsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
      : defaultAllowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow no-origin requests (like mobile apps, curl, etc.)
        callback(null, true);
      } else if (allowedOrigins === '*') {
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        // Explicitly allowed origin
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production' && isPrivateOrigin(origin)) {
        // In development, auto-allow private IPs (10.x, 192.168.x, 172.16-31.x, localhost)
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
     
    
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

//configure express to parse JSON and URL-encoded data
app.use(express.json({limit: '50mb' }));
app.use(express.urlencoded({ extended: true , limit: '50mb'}));
app.use(express.static(publicDir));
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


//routes import
import userRouter from "./routes/user.routes.js"
import jobRouter from "./routes/job.routes.js"
import companyRouter from "./routes/company.routes.js"
import adminRouter from "./routes/admin.routes.js"
import aptitudeTestRouter from "./routes/aptitudeTest.routes.js"
import placementMaterialRouter from "./routes/placementMaterial.routes.js"
import { apiResponse } from "./utils/apiResponse.js"


// routes declaration
// User auth + student profile
app.use("/api/v1/users", userRouter)
// Jobs: student browse/apply, company/admin actions
app.use("/api/v1/jobs", jobRouter)
// Company profile + company jobs
app.use("/api/v1/companies", companyRouter)
// Admin management
app.use("/api/v1/admin", adminRouter)
// Aptitude tests
app.use("/api/v1/tests", aptitudeTestRouter)
// Placement materials for admin upload and student viewing
app.use("/api/v1/materials", placementMaterialRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const payload = err.data || null;
  res.status(status).json(new apiResponse(status, payload, message));
});

export {app}