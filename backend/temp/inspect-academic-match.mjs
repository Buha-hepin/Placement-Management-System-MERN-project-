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

  const sem1Student = (student.semesterAcademicRecords || []).find((r) => Number(r.semester) === 1) || null;
  const sem1Admin = (student.adminAcademicRecords || []).find((r) => Number(r.semester) === 1) || null;

  console.log(JSON.stringify({
    enrollmentNo: student.enrollmentNo,
    cgpa: student.cgpa,
    sem1Student,
    sem1Admin,
    academicVerification: student.academicVerification || null
  }, null, 2));

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('INSPECT_MATCH_FAILED', error?.message || error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
