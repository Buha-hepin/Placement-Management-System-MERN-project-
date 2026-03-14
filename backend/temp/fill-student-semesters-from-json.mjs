import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';

dotenv.config();

const filePath = 'c:/Users/priya/Downloads/official-academic-data-2026-03-13-page-1.json';

const normalizeSemesters = (semesters = []) => {
  return semesters
    .map((s) => ({
      semester: Number(s?.semester || 0),
      spi: Number(s?.spi || 0),
      cpi: Number(s?.cpi || 0),
      backlogCount: Number(s?.backlogCount || 0),
      backlogSubjects: Array.isArray(s?.backlogSubjects) ? s.backlogSubjects : []
    }))
    .filter((s) => s.semester >= 1 && s.semester <= 8)
    .sort((a, b) => a.semester - b.semester);
};

const main = async () => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed) ? parsed : parsed?.records || [];

  if (!Array.isArray(records) || records.length === 0) {
    console.log('NO_RECORDS_IN_FILE');
    return;
  }

  const uri = `${process.env.MONGODB_URI}/hepin`;
  await mongoose.connect(uri);

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
    const user = await User.findOne({ enrollmentNo });

    if (!user) {
      notFound += 1;
      details.push({ enrollmentNo, status: 'not-found' });
      continue;
    }

    user.semesterAcademicRecords = normalized;

    if (Number(user?.cgpa || 0) === 0) {
      const sem8 = normalized.find((r) => r.semester === 8);
      if (sem8 && Number.isFinite(sem8.cpi)) {
        user.cgpa = sem8.cpi;
      }
    }

    await user.save();
    updated += 1;
    details.push({
      enrollmentNo,
      status: 'updated',
      studentId: String(user._id),
      semesters: normalized.length
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
  console.error('FILL_FAILED', error?.message || error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failure
  }
  process.exit(1);
});
