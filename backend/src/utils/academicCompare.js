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
        ? studentRecords.map(normalizeSemesterRecord).filter((r) => r.semester >= 1 && r.semester <= 6)
        : [];
    const normalizedAdmin = Array.isArray(adminRecords)
        ? adminRecords.map(normalizeSemesterRecord).filter((r) => r.semester >= 1 && r.semester <= 6)
        : [];

    const adminMap = new Map(normalizedAdmin.map((record) => [record.semester, record]));
    const studentMap = new Map(normalizedStudent.map((record) => [record.semester, record]));
    const mismatches = [];

    for (let semester = 1; semester <= 6; semester += 1) {
        const student = studentMap.get(semester) || null;
        const admin = adminMap.get(semester) || null;

        if (!student || !admin || isEmptyAcademicRecord(student) || isEmptyAcademicRecord(admin)) {
            mismatches.push({
                semester,
                field: "semester",
                studentValue: student ? student.semester : null,
                adminValue: admin ? admin.semester : null,
                reason: `Academic record incomplete for semester ${semester}.`
            });
            continue;
        }

        if (!valuesAreEqual(student.spi, admin.spi)) {
            mismatches.push({
                semester,
                field: "spi",
                studentValue: student.spi,
                adminValue: admin.spi,
                reason: `SPI mismatch in semester ${semester}.`
            });
        }

        if (!valuesAreEqual(student.cpi, admin.cpi)) {
            mismatches.push({
                semester,
                field: "cpi",
                studentValue: student.cpi,
                adminValue: admin.cpi,
                reason: `CPI mismatch in semester ${semester}.`
            });
        }

        if (student.backlogCount !== admin.backlogCount) {
            mismatches.push({
                semester,
                field: "backlogCount",
                studentValue: student.backlogCount,
                adminValue: admin.backlogCount,
                reason: `Backlog count mismatch in semester ${semester}.`
            });
        }

        const studentSubjectsKey = student.backlogSubjects.join("|");
        const adminSubjectsKey = admin.backlogSubjects.join("|");
        if (studentSubjectsKey !== adminSubjectsKey) {
            mismatches.push({
                semester,
                field: "backlogSubjects",
                studentValue: student.backlogSubjects,
                adminValue: admin.backlogSubjects,
                reason: `Backlog subjects mismatch in semester ${semester}.`
            });
        }
    }

    const mismatchSemesters = [...new Set(mismatches.map((m) => m.semester))].sort((a, b) => a - b);

    return {
        hasMismatch: mismatches.length > 0,
        mismatchCount: mismatchSemesters.length,
        mismatchSemesters,
        mismatchDetails: mismatches,
        comparedAt: new Date()
    };
};
