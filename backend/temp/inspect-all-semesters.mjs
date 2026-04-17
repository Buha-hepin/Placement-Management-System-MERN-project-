import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';

dotenv.config();

const enrollmentNo = process.argv[2] || '23BEIT30012';

const main = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);
  const student = await User.findOne({ enrollmentNo }).lean();

  if (!student) {
    console.log(JSON.stringify({ enrollmentNo, found: false }, null, 2));
    await mongoose.disconnect();
    return;
  }

  const allSemesters = Array.isArray(student.semesterAcademicRecords) ? student.semesterAcademicRecords : [];
  const allAdminSemesters = Array.isArray(student.adminAcademicRecords) ? student.adminAcademicRecords : [];

  console.log(JSON.stringify({
    enrollmentNo: student.enrollmentNo,
    studentSemesters: allSemesters,
    adminSemesters: allAdminSemesters,
    academicVerification: student.academicVerification || null
  }, null, 2));

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('INSPECT_ALL_SEMESTERS_FAILED', error?.message || error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
