import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';
import { compareAcademicRecords } from '../src/utils/academicCompare.js';

dotenv.config();

const main = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);

  const students = await User.find({}).select('enrollmentNo semesterAcademicRecords adminAcademicRecords academicVerification');
  let updated = 0;

  for (const student of students) {
    const verification = compareAcademicRecords(student.semesterAcademicRecords || [], student.adminAcademicRecords || []);

    student.academicVerification = {
      hasMismatch: verification.hasMismatch,
      mismatchCount: verification.mismatchCount,
      mismatchSemesters: verification.mismatchSemesters,
      mismatchDetails: verification.mismatchDetails,
      lastComparedAt: verification.comparedAt
    };

    await student.save();
    updated += 1;
  }

  console.log(JSON.stringify({ total: students.length, updated }, null, 2));
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('RECALC_FAILED', error?.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
