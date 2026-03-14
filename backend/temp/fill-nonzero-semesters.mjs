import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';

dotenv.config();

const targets = ['23BEIT30043', '23BEIT30012', '23BEIT30013', '23BEIT30004', '23BEIT30017'];

const run = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);

  const summary = [];

  for (const enrollmentNo of targets) {
    const user = await User.findOne({ enrollmentNo });
    if (!user) {
      summary.push({ enrollmentNo, status: 'not-found' });
      continue;
    }

    const base = Number(user.cgpa || 7.5);

    const semesterAcademicRecords = Array.from({ length: 8 }, (_, index) => {
      const sem = index + 1;
      const spi = Number(Math.max(5, Math.min(10, base - 0.4 + index * 0.05)).toFixed(2));
      const cpi = Number(Math.max(5, Math.min(10, base - 0.2 + index * 0.04)).toFixed(2));

      return {
        semester: sem,
        spi,
        cpi,
        backlogCount: 0,
        backlogSubjects: []
      };
    });

    user.semesterAcademicRecords = semesterAcademicRecords;
    await user.save();

    summary.push({
      enrollmentNo,
      status: 'updated',
      cgpa: base,
      firstSem: semesterAcademicRecords[0],
      lastSem: semesterAcademicRecords[7]
    });
  }

  await mongoose.disconnect();

  console.log(
    JSON.stringify(
      {
        updated: summary.filter((item) => item.status === 'updated').length,
        details: summary
      },
      null,
      2
    )
  );
};

run().catch(async (error) => {
  console.error('FILL_NONZERO_FAILED', error?.message || error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
