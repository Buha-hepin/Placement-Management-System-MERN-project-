import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';

dotenv.config();

const hasNonZeroSemester = (records = []) => {
  return (records || []).some((r) => Number(r?.spi || 0) > 0 || Number(r?.cpi || 0) > 0 || Number(r?.backlogCount || 0) > 0 || (Array.isArray(r?.backlogSubjects) && r.backlogSubjects.length > 0));
};

const run = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);
  const users = await User.find({ role: 'student' }).select('enrollmentNo fullname semesterAcademicRecords adminAcademicRecords').lean();

  const withNonZeroStudent = users.filter((u) => hasNonZeroSemester(u.semesterAcademicRecords));
  const withNonZeroAdmin = users.filter((u) => hasNonZeroSemester(u.adminAcademicRecords));

  console.log(JSON.stringify({
    totalStudents: users.length,
    nonZeroStudentRecords: withNonZeroStudent.length,
    nonZeroAdminRecords: withNonZeroAdmin.length,
    sampleStudentRecords: withNonZeroStudent.slice(0, 10).map((u) => ({ enrollmentNo: u.enrollmentNo, fullname: u.fullname })),
    sampleAdminRecords: withNonZeroAdmin.slice(0, 10).map((u) => ({ enrollmentNo: u.enrollmentNo, fullname: u.fullname }))
  }, null, 2));

  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error('SCAN_FAILED', e?.message || e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
