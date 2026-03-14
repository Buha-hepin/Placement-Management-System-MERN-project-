const normalizeSubjects = (subjects = []) => {
    if (!Array.isArray(subjects)) return [];
    return subjects
        .map((subject) => String(subject || "").trim().toLowerCase())
        .filter(Boolean)
        .sort();
};

const roundToTwo = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? Number(num.toFixed(2)) : 0;
};

const valuesAreEqual = (a, b, epsilon = 0.01) => Math.abs(Number(a || 0) - Number(b || 0)) <= epsilon;

const isEmptyAcademicRecord = (record = {}) => {
    const spi = Number(record.spi || 0);
    const cpi = Number(record.cpi || 0);
    const backlogCount = Number(record.backlogCount || 0);
    const subjectCount = Array.isArray(record.backlogSubjects) ? record.backlogSubjects.length : 0;
    return spi === 0 && cpi === 0 && backlogCount === 0 && subjectCount === 0;
};

export const normalizeSemesterRecord = (record = {}) => {
    const semester = Number(record.semester || 0);
    const spi = roundToTwo(record.spi || 0);
    const cpi = roundToTwo(record.cpi || 0);
    const backlogSubjects = normalizeSubjects(record.backlogSubjects || []);
    const backlogCount = Math.max(Number(record.backlogCount || 0), backlogSubjects.length);

    return {
        semester,
        spi,
        cpi,
        backlogCount,
        backlogSubjects
    };
};

export const compareAcademicRecords = (studentRecords = [], adminRecords = []) => {
    const normalizedStudent = Array.isArray(studentRecords)
        ? studentRecords.map(normalizeSemesterRecord).filter((r) => r.semester >= 1 && r.semester <= 8)
        : [];
    const normalizedAdmin = Array.isArray(adminRecords)
        ? adminRecords.map(normalizeSemesterRecord).filter((r) => r.semester >= 1 && r.semester <= 8)
        : [];

    // If official/admin data does not exist yet, do not mark student data as mismatch.
    if (normalizedAdmin.length === 0) {
        return {
            hasMismatch: false,
            mismatchCount: 0,
            mismatchSemesters: [],
            mismatchDetails: [],
            comparedAt: new Date()
        };
    }

    const adminMap = new Map(normalizedAdmin.map((record) => [record.semester, record]));
    const mismatches = [];

    for (const student of normalizedStudent) {
        const admin = adminMap.get(student.semester);
        if (!admin) {
            // Skip missing semester mismatch if student semester row is effectively empty.
            if (!isEmptyAcademicRecord(student)) {
                mismatches.push({
                    semester: student.semester,
                    field: "semester",
                    studentValue: student.semester,
                    adminValue: null,
                    reason: `Official admin record missing for semester ${student.semester}.`
                });
            }
            continue;
        }

        if (!valuesAreEqual(student.spi, admin.spi)) {
            mismatches.push({
                semester: student.semester,
                field: "spi",
                studentValue: student.spi,
                adminValue: admin.spi,
                reason: `SPI mismatch in semester ${student.semester}.`
            });
        }

        if (!valuesAreEqual(student.cpi, admin.cpi)) {
            mismatches.push({
                semester: student.semester,
                field: "cpi",
                studentValue: student.cpi,
                adminValue: admin.cpi,
                reason: `CPI mismatch in semester ${student.semester}.`
            });
        }

        if (student.backlogCount !== admin.backlogCount) {
            mismatches.push({
                semester: student.semester,
                field: "backlogCount",
                studentValue: student.backlogCount,
                adminValue: admin.backlogCount,
                reason: `Backlog count mismatch in semester ${student.semester}.`
            });
        }

        const studentSubjectsKey = student.backlogSubjects.join("|");
        const adminSubjectsKey = admin.backlogSubjects.join("|");
        if (studentSubjectsKey !== adminSubjectsKey) {
            mismatches.push({
                semester: student.semester,
                field: "backlogSubjects",
                studentValue: student.backlogSubjects,
                adminValue: admin.backlogSubjects,
                reason: `Backlog subjects mismatch in semester ${student.semester}.`
            });
        }
    }

    const studentSemesters = new Set(normalizedStudent.map((r) => r.semester));
    for (const admin of normalizedAdmin) {
        if (!studentSemesters.has(admin.semester) && !isEmptyAcademicRecord(admin)) {
            mismatches.push({
                semester: admin.semester,
                field: "semester",
                studentValue: null,
                adminValue: admin.semester,
                reason: `Student record missing for semester ${admin.semester}.`
            });
        }
    }

    const mismatchSemesters = [...new Set(mismatches.map((m) => m.semester))].sort((a, b) => a - b);

    return {
        hasMismatch: mismatches.length > 0,
        mismatchCount: mismatches.length,
        mismatchSemesters,
        mismatchDetails: mismatches,
        comparedAt: new Date()
    };
};
