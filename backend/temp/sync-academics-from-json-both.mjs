import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';
import { normalizeSemesterRecord, compareAcademicRecords } from '../src/utils/academicCompare.js';

dotenv.config();

const filePath =
  process.argv[2] ||
  'c:/Users/priya/Downloads/official-academic-data-2026-03-13-page-1.json';

const normalizeSemesters = (semesters = []) => {
  return semesters
    .map((record) => normalizeSemesterRecord(record))
    .filter((record) => record.semester >= 1 && record.semester <= 8)
    .sort((a, b) => a.semester - b.semester);
};

const main = async () => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed) ? parsed : parsed?.records || [];

  if (!records.length) {
    console.log('NO_RECORDS_IN_FILE');
    return;
  }

  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);

  let updated = 0;
  let notFound = 0;
  let skipped = 0;
  const details = [];

  for (const item of records) {
    const enrollmentNo = String(item?.enrollmentNo || '').trim().toUpperCase();
    const semesters = Array.isArray(item?.semesters) ? item.semesters : [];

    if (!enrollmentNo || semesters.length === 0) {
      skipped += 1;
      details.push({ enrollmentNo: enrollmentNo || null, status: 'skipped-invalid' });
      continue;
    }

    const normalized = normalizeSemesters(semesters);
    const student = await User.findOne({ enrollmentNo });

    if (!student) {
      notFound += 1;
      details.push({ enrollmentNo, status: 'not-found' });
      continue;
    }

    student.semesterAcademicRecords = normalized;
    student.adminAcademicRecords = normalized;

    const verification = compareAcademicRecords(
      student.semesterAcademicRecords || [],
      student.adminAcademicRecords || []
    );

    student.academicVerification = {
      hasMismatch: verification.hasMismatch,
      mismatchCount: verification.mismatchCount,
      mismatchSemesters: verification.mismatchSemesters,
      mismatchDetails: verification.mismatchDetails,
      lastComparedAt: verification.comparedAt
    };

    const sem8 = normalized.find((r) => r.semester === 8);
    if (sem8 && Number.isFinite(sem8.cpi)) {
      student.cgpa = sem8.cpi;
    }

    await student.save();
    updated += 1;

    details.push({
      enrollmentNo,
      status: 'updated',
      semesterCount: normalized.length,
      hasMismatch: student.academicVerification.hasMismatch,
      mismatchCount: student.academicVerification.mismatchCount
    });
  }

  await mongoose.disconnect();

  console.log(
    JSON.stringify(
      {
        total: records.length,
        updated,
        notFound,
        skipped,
        details
      },
      null,
      2
    )
  );
};

main().catch(async (error) => {
  console.error('SYNC_BOTH_FAILED', error?.message || error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failure
  }
  process.exit(1);
});