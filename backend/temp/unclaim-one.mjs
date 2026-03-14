import mongoose from "mongoose";
import dotenv from "dotenv";
import { StudentMaster } from "../src/models/studentMaster.model.js";

dotenv.config();
await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);

const enrollmentNo = "23BEIT30012";
const updated = await StudentMaster.findOneAndUpdate(
  { enrollmentNo },
  {
    isClaimed: false,
    claimedBy: null,
    claimedAt: null,
    registrationOtp: null,
    registrationOtpExpiry: null,
    registrationOtpVerifiedAt: null,
    registrationOtpAttempts: 0
  },
  { new: true }
).lean();

console.log(JSON.stringify({ enrollmentNo, found: Boolean(updated), isClaimed: updated?.isClaimed ?? null }, null, 2));
await mongoose.disconnect();
