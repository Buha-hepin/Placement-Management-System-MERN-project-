const normalizeSubjects = (subjects = []) => {
    if (!Array.isArray(subjects)) return [];
    return subjects
        .map((subject) => String(subject || "").trim().toLowerCase())
        .filter(Boolean)
        .sort();
};

export const normalizeSemesterRecord = (record = {}) => {
    const semester = Number(record.semester || 0);
    const spi = Number(record.spi || 0);
    const cpi = Number(record.cpi || 0);
    const backlogCount = Number(record.backlogCount || 0);
    const backlogSubjects = normalizeSubjects(record.backlogSubjects || []);

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

    const adminMap = new Map(normalizedAdmin.map((record) => [record.semester, record]));
    const mismatches = [];

    for (const student of normalizedStudent) {
        const admin = adminMap.get(student.semester);
        if (!admin) {
            mismatches.push({
                semester: student.semester,
                field: "semester",
                studentValue: student.semester,
                adminValue: null,
                reason: `Official admin record missing for semester ${student.semester}.`
            });
            continue;
        }

        if (student.spi !== admin.spi) {
            mismatches.push({
                semester: student.semester,
                field: "spi",
                studentValue: student.spi,
                adminValue: admin.spi,
                reason: `SPI mismatch in semester ${student.semester}.`
            });
        }

        if (student.cpi !== admin.cpi) {
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
        if (!studentSemesters.has(admin.semester)) {
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
