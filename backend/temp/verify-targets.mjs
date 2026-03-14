import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/user.model.js";

dotenv.config();
const targets = ["23BEIT30043", "23BEIT30012", "23BEIT30004", "23BEIT30017"];
await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);
const rows = await User.find({ enrollmentNo: { $in: targets } })
  .select("enrollmentNo cgpa semesterAcademicRecords adminAcademicRecords academicVerification")
  .lean();
console.log(JSON.stringify(rows.map((u) => ({
  enrollmentNo: u.enrollmentNo,
  cgpa: u.cgpa,
  sem1: u.semesterAcademicRecords?.[0] || null,
  sem8: u.semesterAcademicRecords?.[7] || null,
  mismatchCount: u.academicVerification?.mismatchCount || 0,
  hasMismatch: !!u.academicVerification?.hasMismatch
})), null, 2));
await mongoose.disconnect();
