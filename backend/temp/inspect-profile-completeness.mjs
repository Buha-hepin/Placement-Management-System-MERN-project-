import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';

dotenv.config();

const enrollmentNo = process.argv[2] || '23BEIT30012';

const isPositiveNumber = (value) => Number(value) > 0;

const main = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/hepin`);
  const student = await User.findOne({ enrollmentNo }).lean();

  if (!student) {
    console.log(JSON.stringify({ enrollmentNo, found: false }, null, 2));
    await mongoose.disconnect();
    return;
  }

  const semesters = Array.isArray(student.semesterAcademicRecords) ? student.semesterAcademicRecords : [];
  const semesterMap = new Map(semesters.map((record) => [Number(record?.semester || 0), record]));
  const semesterChecks = [1, 2, 3, 4, 5, 6].map((sem) => {
    const record = semesterMap.get(sem);
    return {
      semester: sem,
      exists: Boolean(record),
      spi: record?.spi ?? null,
      cpi: record?.cpi ?? null,
      backlogCount: record?.backlogCount ?? null,
      missingReason: !record ? 'missing' : (!isPositiveNumber(record.spi) || !isPositiveNumber(record.cpi) ? 'non-positive spi/cpi' : null)
    };
  });

  const skills = Array.isArray(student.skills) ? student.skills.filter(Boolean) : [];

  const completeness = {
    fullname: Boolean(String(student.fullname || '').trim()),
    email: Boolean(String(student.email || '').trim()),
    branch: Boolean(String(student.branch || '').trim()),
    phone: Boolean(String(student.phone || '').trim()),
    resumeUrl: Boolean(String(student.resumeUrl || '').trim()),
    cgpa: Number(student.cgpa || 0) > 0,
    skills: skills.length > 0,
    semesters: semesterChecks.every((item) => item.exists && isPositiveNumber(item.spi) && isPositiveNumber(item.cpi))
  };

  const profileComplete = Object.values(completeness).every(Boolean);

  console.log(JSON.stringify({
    enrollmentNo: student.enrollmentNo,
    fullname: student.fullname,
    email: student.email,
    branch: student.branch,
    phone: student.phone,
    resumeUrl: student.resumeUrl,
    cgpa: student.cgpa,
    skills,
    semesterChecks,
    completeness,
    profileComplete
  }, null, 2));

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('INSPECT_FAILED', error?.message || error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
