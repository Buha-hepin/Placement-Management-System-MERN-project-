import React, { useState } from 'react';
import { FiSearch, FiEye, FiDownload } from 'react-icons/fi';

export default function CompanyApplicants() {
  // --- STATE: APPLICANTS DATA ---
  const [applicants, setApplicants] = useState([
    { id: 101, name: "Rahul Patel", role: "SDE-1", cgpa: "8.45", status: "Pending", date: "29 Dec", email: "rahul@ldrp.ac.in" },
    { id: 102, name: "Priya Sharma", role: "UI/UX Intern", cgpa: "9.10", status: "Shortlisted", date: "28 Dec", email: "priya@ldrp.ac.in" },
    { id: 103, name: "Amit Kumar", role: "SDE-1", cgpa: "7.20", status: "Rejected", date: "27 Dec", email: "amit@ldrp.ac.in" },
  ]);

  // --- HANDLER: STATUS UPDATE ---
  const handleStatusUpdate = (id, newStatus) => {
    setApplicants(applicants.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  return (
    <div className="animate-fade-in">
       {/* Header */}
       <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">Candidate Applications 👥</h2>
         <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
             <span className="font-bold text-blue-700">{applicants.length} Total</span>
         </div>
       </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800">Recent Applications</h3>
          <div className="relative w-full md:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search student..." className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-900 font-semibold">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Applied For</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applicants.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {app.name} <br/><span className="text-xs text-gray-400 font-normal">{app.email}</span>
                  </td>
                  <td className="px-6 py-4">{app.role}</td>
                  <td className="px-6 py-4"><span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold">{app.cgpa}</span></td>
                  <td className="px-6 py-4">{app.date}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={app.status} 
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none
                        ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shortlisted">Shortlist</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View Profile"><FiEye /></button>
                    <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Download Resume"><FiDownload /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applicants.length === 0 && <div className="p-8 text-center text-gray-500">No applicants found.</div>}
      </div>
    </div>
  );
}