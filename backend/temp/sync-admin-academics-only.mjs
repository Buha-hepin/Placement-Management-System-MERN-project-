import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';
import { normalizeSemesterRecord, compareAcademicRecords } from '../src/utils/academicCompare.js';

dotenv.config();

const filePath = process.argv[2] || 'D:/Downloads/final_data.json';
const targetEnrollment = String(process.argv[3] || '23BEIT30012').trim().toUpperCase();

const normalizeSemesters = (semesters = []) => {
  return semesters
    .map((record) => normalizeSemesterRecord(record))
    .filter((record) => record.semester >= 1 && record.semester <= 6)
    .sort((a, b) => a.semester - b.semester);
};

const main = async () => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed) ? parsed : parsed?.records || [];

  const match = records.find((item) => String(item?.enrollmentNo || '').trim().toUpperCase() === targetEnrollment);
  if (!match) {
    console.log(JSON.stringify({ found: false, enrollmentNo: targetEnrollment }, null, 2));
    return;
  }

  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);
  const student = await User.findOne({ enrollmentNo: targetEnrollment });
  if (!student) {
    console.log(JSON.stringify({ found: false, enrollmentNo: targetEnrollment }, null, 2));
    await mongoose.disconnect();
    return;
  }

  const normalizedAdmin = normalizeSemesters(Array.isArray(match.semesters) ? match.semesters : []);
  student.adminAcademicRecords = normalizedAdmin;

  const verification = compareAcademicRecords(student.semesterAcademicRecords || [], student.adminAcademicRecords || []);
  student.academicVerification = {
    hasMismatch: verification.hasMismatch,
    mismatchCount: verification.mismatchCount,
    mismatchSemesters: verification.mismatchSemesters,
    mismatchDetails: verification.mismatchDetails,
    lastComparedAt: verification.comparedAt
  };

  await student.save();

  console.log(JSON.stringify({
    enrollmentNo: student.enrollmentNo,
    studentSem1: (student.semesterAcademicRecords || []).find((r) => Number(r.semester) === 1) || null,
    adminSem1: (student.adminAcademicRecords || []).find((r) => Number(r.semester) === 1) || null,
    hasMismatch: student.academicVerification.hasMismatch,
    mismatchCount: student.academicVerification.mismatchCount,
    mismatchSemesters: student.academicVerification.mismatchSemesters
  }, null, 2));

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('SYNC_ADMIN_ONLY_FAILED', error?.message || error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
