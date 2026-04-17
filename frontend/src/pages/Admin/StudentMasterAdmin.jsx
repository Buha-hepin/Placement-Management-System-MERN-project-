import React, { useEffect, useState } from 'react';
import { Database, Search, Upload, Plus, Phone, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import {
  bulkUploadStudentMaster,
  getStudentMasterRecords,
  uploadStudentMasterCsv,
  deleteStudentMasterRecord
} from '../../services/api.js';

const emptyRow = { enrollmentNo: '', phone: '', email: '' };

export default function StudentMasterAdmin() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [manualRows, setManualRows] = useState([{ ...emptyRow }]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvParsedRows, setCsvParsedRows] = useState([]);
  const [lastUploadSummary, setLastUploadSummary] = useState(null);
  const [lastUploadedSheet, setLastUploadedSheet] = useState(null);
  const [showUploadedSheet, setShowUploadedSheet] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const fetchRecords = async (searchText = search, targetPage = page) => {
    try {
      setLoading(true);
      const response = await getStudentMasterRecords(targetPage, 20, searchText);
      setRecords(response?.data?.records || []);
      setTotalCount(Number(response?.data?.totalCount || 0));
    } catch (error) {
      window.appAlert(error.message || 'Failed to fetch student master records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(1);
    await fetchRecords(search, 1);
  };

  const handleManualRowChange = (index, key, value) => {
    setManualRows((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const addManualRow = () => {
    setManualRows((prev) => [...prev, { ...emptyRow }]);
  };

  const removeManualRow = (index) => {
    setManualRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const uploadManualRows = async () => {
    const cleanedRows = manualRows
      .map((row) => ({
        enrollmentNo: String(row.enrollmentNo || '').trim().toUpperCase(),
        phone: String(row.phone || '').trim(),
        email: String(row.email || '').trim().toLowerCase()
      }))
      .filter((row) => row.enrollmentNo && row.phone);

    if (!cleanedRows.length) {
      window.appAlert('Please add at least one valid row with enrollment number and phone.');
      return;
    }

    try {
      setUploading(true);
      const response = await bulkUploadStudentMaster(cleanedRows);
      window.appAlert(response?.message || 'Student master rows uploaded');
      setManualRows([{ ...emptyRow }]);
      await fetchRecords();
    } catch (error) {
      window.appAlert(error.message || 'Manual upload failed');
    } finally {
      setUploading(false);
    }
  };

  const uploadCsv = async () => {
    if (!csvFile) {
      window.appAlert('Please choose a CSV file first.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', csvFile);
      const response = await uploadStudentMasterCsv(formData);
      setLastUploadSummary(response?.data || null);
      setLastUploadedSheet({
        fileName: String(csvFile?.name || 'uploaded.csv'),
        headers: Array.isArray(csvHeaders) ? [...csvHeaders] : [],
        rows: Array.isArray(csvParsedRows) ? [...csvParsedRows] : [],
        uploadedAt: new Date().toISOString()
      });
      setShowUploadedSheet(true);
      window.appAlert(response?.message || 'CSV uploaded successfully');
      setCsvFile(null);
      setCsvHeaders([]);
      setCsvPreviewRows([]);
      setCsvParsedRows([]);
      await fetchRecords();
    } catch (error) {
      window.appAlert(error.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  const parseCsvLine = (line = '') => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const handleCsvFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setCsvFile(file);
    setLastUploadSummary(null);

    if (!file) {
      setCsvHeaders([]);
      setCsvPreviewRows([]);
      setCsvParsedRows([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (!lines.length) {
        setCsvHeaders([]);
        setCsvPreviewRows([]);
        return;
      }

      const headers = parseCsvLine(lines[0]);
      const rows = lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row = {};
        headers.forEach((header, index) => {
          row[header || `Column ${index + 1}`] = values[index] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvParsedRows(rows);
      setCsvPreviewRows(rows.slice(0, 25));
    };

    reader.readAsText(file);
  };

  const handleDeleteRecord = async (recordId, enrollmentNo) => {
    if (!(await window.appConfirm(`Delete master record for ${enrollmentNo}? This will allow the student to re-register.`))) return;
    try {
      await deleteStudentMasterRecord(recordId);
      window.appAlert(`Record ${enrollmentNo} deleted`);
      await fetchRecords();
    } catch (error) {
      window.appAlert(error.message || 'Delete failed');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="text-blue-600" /> Student Master Verification
        </h1>
        <p className="text-gray-600 mt-2">
          Preload enrollment number and phone records. Only these students can register.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Upload via CSV</h2>
        <p className="text-sm text-gray-500">CSV headers should include enrollmentNo, phone, email(optional).</p>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvFileChange}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button
            onClick={uploadCsv}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          {!!lastUploadedSheet && (
            <button
              type="button"
              onClick={() => setShowUploadedSheet((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              {showUploadedSheet ? 'Hide Uploaded Sheet' : 'View Uploaded Sheet'}
            </button>
          )}
        </div>

        {!!csvFile && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-800">CSV Preview: {csvFile.name}</p>
            {csvHeaders.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg border border-blue-100">
                <table className="min-w-full text-xs">
                  <thead className="bg-blue-50 text-blue-900">
                    <tr>
                      {csvHeaders.map((header, index) => (
                        <th key={`${header}-${index}`} className="px-3 py-2 text-left font-semibold">
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreviewRows.map((row, idx) => (
                      <tr key={idx} className="border-t border-blue-50">
                        {csvHeaders.map((header, colIdx) => (
                          <td key={`${idx}-${colIdx}`} className="px-3 py-2 text-gray-700">
                            {row[header || `Column ${colIdx + 1}`] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-blue-700">No readable rows found in CSV.</p>
            )}
            <p className="text-xs text-blue-700">Showing up to first 25 rows before upload.</p>
          </div>
        )}

        {!!lastUploadSummary && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800 mb-2">Last CSV Upload Summary</p>
            <div className="text-sm text-emerald-900 grid grid-cols-2 md:grid-cols-4 gap-2">
              <p>Total: {Number(lastUploadSummary.total || 0)}</p>
              <p>Inserted: {Number(lastUploadSummary.inserted || 0)}</p>
              <p>Updated: {Number(lastUploadSummary.updated || 0)}</p>
              <p>Invalid: {Number(lastUploadSummary.invalid || 0)}</p>
            </div>
          </div>
        )}

        {showUploadedSheet && !!lastUploadedSheet && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
            <p className="text-sm font-semibold text-indigo-900">
              Uploaded Sheet: {lastUploadedSheet.fileName}
            </p>
            <p className="text-xs text-indigo-700">
              Uploaded at: {new Date(lastUploadedSheet.uploadedAt).toLocaleString()} | Rows: {lastUploadedSheet.rows.length}
            </p>

            {lastUploadedSheet.headers.length > 0 ? (
              <div className="max-h-80 overflow-auto bg-white rounded-lg border border-indigo-100">
                <table className="min-w-full text-xs">
                  <thead className="bg-indigo-100 text-indigo-900 sticky top-0">
                    <tr>
                      {lastUploadedSheet.headers.map((header, index) => (
                        <th key={`${header}-${index}`} className="px-3 py-2 text-left font-semibold">
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lastUploadedSheet.rows.map((row, idx) => (
                      <tr key={idx} className="border-t border-indigo-50">
                        {lastUploadedSheet.headers.map((header, colIdx) => (
                          <td key={`${idx}-${colIdx}`} className="px-3 py-2 text-gray-700">
                            {row[header || `Column ${colIdx + 1}`] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-indigo-700">Uploaded sheet data is not available.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Quick Manual Add</h2>
        <div className="space-y-3">
          {manualRows.map((row, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-2">
              <input
                className="md:col-span-4 px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="Enrollment No"
                value={row.enrollmentNo}
                onChange={(e) => handleManualRowChange(index, 'enrollmentNo', e.target.value)}
              />
              <input
                className="md:col-span-3 px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="Phone"
                value={row.phone}
                onChange={(e) => handleManualRowChange(index, 'phone', e.target.value)}
              />
              <input
                className="md:col-span-3 px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="Email (optional)"
                value={row.email}
                onChange={(e) => handleManualRowChange(index, 'email', e.target.value)}
              />
              {manualRows.length > 1 && (
                <button
                  onClick={() => removeManualRow(index)}
                  className="md:col-span-10 text-sm text-red-600 hover:text-red-700 text-left"
                >
                  Remove Row
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={addManualRow}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} /> Add Row
          </button>
          <button
            onClick={uploadManualRows}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400"
          >
            <ShieldCheck size={16} /> {uploading ? 'Saving...' : 'Save Rows'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">Master Records ({totalCount})</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enrollment/phone/email"
              className="px-3 py-2 border border-gray-200 rounded-lg"
            />
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white">
              <Search size={14} /> Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading records...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Enrollment</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Claimed</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-800">{record.enrollmentNo}</td>
                    <td className="px-4 py-3 text-gray-700 flex items-center gap-2"><Phone size={14} /> {record.phone}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {record.email ? <span className="inline-flex items-center gap-2"><Mail size={14} /> {record.email}</span> : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${record.isClaimed ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {record.isClaimed ? 'Claimed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteRecord(record._id, record.enrollmentNo)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
