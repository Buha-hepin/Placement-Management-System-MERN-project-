import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, ClipboardCheck, AlertTriangle, X, Download } from 'lucide-react';
import {
  getAllStudents,
  deleteStudent,
  getAcademicMismatchStudents,
  getStudentAcademicDetails,
  updateStudentOfficialAcademics,
  bulkUploadOfficialAcademics,
} from '../../services/api.js';

const MAX_ACADEMIC_SEMESTER = 6;

const buildDefaultSemesters = () => (
  Array.from({ length: MAX_ACADEMIC_SEMESTER }, (_, index) => ({
    semester: index + 1,
    spi: '',
    cpi: '',
    backlogCount: 0,
    backlogSubjects: []
  }))
);

const mergeSemesterRecords = (records = []) => {
  const base = buildDefaultSemesters();
  const map = new Map((records || []).map((record) => [Number(record.semester), record]));
  return base.map((entry) => {
    const found = map.get(entry.semester);
    if (!found) return entry;
    return {
      semester: entry.semester,
      spi: found.spi ?? '',
      cpi: found.cpi ?? '',
      backlogCount: Number(found.backlogCount || 0),
      backlogSubjects: Array.isArray(found.backlogSubjects) ? found.backlogSubjects : []
    };
  });
};

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [mismatchStudents, setMismatchStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showMismatchOnly, setShowMismatchOnly] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adminAcademicRecords, setAdminAcademicRecords] = useState(buildDefaultSemesters());
  const [savingOfficial, setSavingOfficial] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchStudents();
    fetchMismatchStudents();
  }, [page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getAllStudents(page, limit, search);
      setStudents(response?.data?.students || []);
      setTotalCount(response?.data?.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      window.appAlert('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchMismatchStudents = async () => {
    try {
      const response = await getAcademicMismatchStudents(1, 50, search);
      setMismatchStudents(response?.data?.students || []);
    } catch (error) {
      console.error('Failed to fetch mismatch students:', error);
    }
  };

  const handleDelete = async (studentId) => {
    if (!(await window.appConfirm('Are you sure you want to delete this student?'))) return;

    try {
      await deleteStudent(studentId);
      window.appAlert('Student deleted successfully');
      fetchStudents();
      fetchMismatchStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
      window.appAlert('Failed to delete student');
    }
  };

  const handleOpenAcademicModal = async (studentId) => {
    try {
      const response = await getStudentAcademicDetails(studentId);
      const student = response?.data;
      if (!student) return;

      setSelectedStudent(student);
      setAdminAcademicRecords(mergeSemesterRecords(student.adminAcademicRecords || []));
    } catch (error) {
      console.error('Failed to fetch student academic details:', error);
      window.appAlert(error.message || 'Failed to open academic details');
    }
  };

  const handleAdminAcademicChange = (semester, field, value) => {
    setAdminAcademicRecords((prev) => prev.map((record) => {
      if (record.semester !== semester) return record;

      if (field === 'backlogSubjects') {
        const subjects = String(value || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        return { ...record, backlogSubjects: subjects, backlogCount: subjects.length };
      }

      return { ...record, [field]: value };
    }));
  };

  const handleSaveOfficialAcademics = async () => {
    if (!selectedStudent?._id) return;

    try {
      setSavingOfficial(true);
      const payload = adminAcademicRecords.map((record) => ({
        semester: record.semester,
        spi: Number(record.spi || 0),
        cpi: Number(record.cpi || 0),
        backlogCount: Number(record.backlogCount || 0),
        backlogSubjects: Array.isArray(record.backlogSubjects) ? record.backlogSubjects : []
      }));

      const response = await updateStudentOfficialAcademics(selectedStudent._id, payload);
      setSelectedStudent(response?.data || null);
      setAdminAcademicRecords(mergeSemesterRecords(response?.data?.adminAcademicRecords || []));
      await fetchStudents();
      await fetchMismatchStudents();
      window.appAlert('Official academic data updated and compared successfully.');
    } catch (error) {
      console.error('Failed to update official academics:', error);
      window.appAlert(error.message || 'Failed to update official academics');
    } finally {
      setSavingOfficial(false);
    }
  };

  const handleBulkOfficialUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBulk(true);
      const text = await file.text();
      const parsed = JSON.parse(text);
      const records = Array.isArray(parsed) ? parsed : parsed?.records;

      if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Invalid file format. Expected { records: [...] } or direct array.');
      }

      const response = await bulkUploadOfficialAcademics(records);
      await fetchStudents();
      await fetchMismatchStudents();

      const summary = response?.data;
      window.appAlert(
        `Bulk upload completed. Updated: ${summary?.updated || 0}, Not found: ${summary?.notFound || 0}, Invalid: ${summary?.invalid || 0}, Mismatched: ${summary?.mismatchedAfterCompare || 0}`
      );
    } catch (error) {
      console.error('Bulk official upload failed:', error);
      window.appAlert(error.message || 'Bulk upload failed');
    } finally {
      setUploadingBulk(false);
      event.target.value = '';
    }
  };

  const handleDownloadOfficialJson = () => {
    if (!Array.isArray(studentsToRender) || studentsToRender.length === 0) {
      window.appAlert('No students available to export');
      return;
    }

    const payload = {
      records: studentsToRender.map((student) => {
        const sourceSemesters = Array.isArray(student?.adminAcademicRecords) && student.adminAcademicRecords.length > 0
          ? student.adminAcademicRecords
          : mergeSemesterRecords(student?.semesterAcademicRecords || []);

        const semesters = sourceSemesters.map((record) => ({
          semester: Number(record?.semester || 0),
          spi: Number(record?.spi || 0),
          cpi: Number(record?.cpi || 0),
          backlogCount: Number(record?.backlogCount || 0),
          backlogSubjects: Array.isArray(record?.backlogSubjects) ? record.backlogSubjects : []
        }));

        return {
          enrollmentNo: String(student?.enrollmentNo || '').toUpperCase(),
          semesters
        };
      })
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `official-academic-data-${date}-page-${page}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / limit);
  const studentsToRender = showMismatchOnly ? mismatchStudents : students;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="text-blue-600" /> Manage Students
        </h1>
        <p className="text-gray-600 mt-2">View and manage all registered students</p>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
            Mismatch Alerts: {mismatchStudents.length}
          </span>
          <button
            onClick={() => setShowMismatchOnly((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {showMismatchOnly ? 'Show All Students' : 'Show Only Mismatch Students'}
          </button>
          <label className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer">
            {uploadingBulk ? 'Uploading...' : 'Upload Official Data (JSON)'}
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleBulkOfficialUpload}
              disabled={uploadingBulk}
              className="hidden"
            />
          </label>
          <button
            onClick={handleDownloadOfficialJson}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Download size={14} /> Download Official Data (JSON)
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or enrollment number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Students ({totalCount})</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : studentsToRender.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Enrollment No.</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Branch</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentsToRender.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 pl-6">
                      <div>
                        <p className="font-semibold text-gray-800">{student.fullname}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{student.enrollmentNo}</td>
                    <td className="p-4 text-gray-600">{student.email}</td>
                    <td className="p-4 text-gray-600">{student.branch || 'N/A'}</td>
                    <td className="p-4">
                      {student?.academicVerification?.hasMismatch ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          <AlertTriangle size={12} /> {student?.academicVerification?.mismatchCount || 0} semester{(student?.academicVerification?.mismatchCount || 0) === 1 ? '' : 's'} mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          <ClipboardCheck size={12} /> Clean
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenAcademicModal(student._id)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                          title="Manage academics"
                        >
                          <ClipboardCheck size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Delete student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-6 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Academic Verification: {selectedStudent.fullname}</h3>
                <p className="text-sm text-gray-500">{selectedStudent.enrollmentNo} | {selectedStudent.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            {selectedStudent?.academicVerification?.hasMismatch ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                Mismatch detected in semester(s): {(selectedStudent.academicVerification?.mismatchSemesters || []).join(', ')}
              </div>
            ) : (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                No mismatch currently detected between student and official records.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Student Submitted Data</h4>
                <div className="max-h-80 overflow-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-2 text-left">Sem</th><th className="p-2 text-left">SPI</th><th className="p-2 text-left">CPI</th><th className="p-2 text-left">Backlogs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergeSemesterRecords(selectedStudent.semesterAcademicRecords || []).map((record) => (
                        <tr key={`student-${record.semester}`} className="border-t border-gray-100">
                          <td className="p-2">{record.semester}</td>
                          <td className="p-2">{record.spi === '' ? 'N/A' : record.spi}</td>
                          <td className="p-2">{record.cpi === '' ? 'N/A' : record.cpi}</td>
                          <td className="p-2">{record.backlogCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Admin Official Data (Editable)</h4>
                <div className="max-h-80 overflow-auto border border-gray-100 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-2 text-left">Sem</th><th className="p-2 text-left">SPI</th><th className="p-2 text-left">CPI</th><th className="p-2 text-left">Backlog Subjects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAcademicRecords.map((record) => (
                        <tr key={`admin-${record.semester}`} className="border-t border-gray-100">
                          <td className="p-2">{record.semester}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.01"
                              value={record.spi}
                              onChange={(e) => handleAdminAcademicChange(record.semester, 'spi', e.target.value)}
                              className="w-16 border border-gray-300 rounded px-1 py-0.5"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.01"
                              value={record.cpi}
                              onChange={(e) => handleAdminAcademicChange(record.semester, 'cpi', e.target.value)}
                              className="w-16 border border-gray-300 rounded px-1 py-0.5"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={(record.backlogSubjects || []).join(', ')}
                              onChange={(e) => handleAdminAcademicChange(record.semester, 'backlogSubjects', e.target.value)}
                              className="w-full border border-gray-300 rounded px-1 py-0.5"
                              placeholder="Math-2, Physics"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {Array.isArray(selectedStudent?.academicVerification?.mismatchDetails) && selectedStudent.academicVerification.mismatchDetails.length > 0 && (
              <div className="mt-4 border border-red-100 rounded-lg p-3 bg-red-50">
                <h4 className="font-semibold text-red-800 mb-2">Mismatch Details</h4>
                <div className="max-h-32 overflow-auto text-xs text-red-700 space-y-1">
                  {selectedStudent.academicVerification.mismatchDetails.map((item, index) => (
                    <p key={`${item.field}-${item.semester}-${index}`}>Sem {item.semester} | {item.field}: {item.reason}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Close</button>
              <button
                onClick={handleSaveOfficialAcademics}
                disabled={savingOfficial}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {savingOfficial ? 'Saving...' : 'Save Official Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}