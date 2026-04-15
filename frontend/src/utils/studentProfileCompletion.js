const hasValue = (value) => String(value ?? '').trim().length > 0;

const hasValidCgpa = (cgpa) => {
  const numericCgpa = Number(cgpa);
  return Number.isFinite(numericCgpa) && numericCgpa >= 0 && numericCgpa <= 10;
};

const hasValidSemesterRecords = (records = []) => {
  if (!Array.isArray(records) || records.length < 8) return false;

  const semesters = new Set();
  for (const record of records) {
    const sem = Number(record?.semester);
    const spi = Number(record?.spi);
    const cpi = Number(record?.cpi);
    const backlogCount = Number(record?.backlogCount ?? 0);

    if (!Number.isInteger(sem) || sem < 1 || sem > 8) return false;
    if (!Number.isFinite(spi) || spi < 0 || spi > 10) return false;
    if (!Number.isFinite(cpi) || cpi < 0 || cpi > 10) return false;
    if (!Number.isFinite(backlogCount) || backlogCount < 0) return false;

    semesters.add(sem);
  }

  return semesters.size === 8;
};

export const evaluateStudentProfileCompletion = (student = {}) => {
  const missingFields = [];

  if (!hasValue(student?.fullname)) missingFields.push('fullName');
  if (!hasValue(student?.email)) missingFields.push('email');
  if (!hasValue(student?.branch)) missingFields.push('branch');
  if (!hasValue(student?.phone)) missingFields.push('phone');
  if (!hasValidCgpa(student?.cgpa)) missingFields.push('cgpa');
  if (!Array.isArray(student?.skills) || student.skills.length === 0) missingFields.push('skills');
  if (!hasValue(student?.resumeUrl)) missingFields.push('resume');
  if (!hasValidSemesterRecords(student?.semesterAcademicRecords || [])) {
    missingFields.push('semesterAcademicRecords');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};
