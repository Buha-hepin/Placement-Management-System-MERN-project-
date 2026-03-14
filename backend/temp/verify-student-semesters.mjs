import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);

  const target = await User.findOne({ enrollmentNo: '23BEIT30012' }).select(
    'enrollmentNo fullname cgpa semesterAcademicRecords adminAcademicRecords'
  );

  if (!target) {
    console.log('STUDENT_NOT_FOUND');
    await mongoose.disconnect();
    return;
  }

  const sem = target.semesterAcademicRecords || [];
  const adminSem = target.adminAcademicRecords || [];

  console.log(
    JSON.stringify(
      {
        enrollmentNo: target.enrollmentNo,
        fullname: target.fullname,
        cgpa: target.cgpa,
        semesterCount: sem.length,
        firstTwoSemesters: sem.slice(0, 2),
        adminSemesterCount: adminSem.length,
        firstTwoAdminSemesters: adminSem.slice(0, 2)
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (e) => {
  console.error('VERIFY_FAILED', e?.message || e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
