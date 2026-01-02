import React from 'react';

const MyApplications = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Application History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
            <tr>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">Google India</td>
              <td className="px-6 py-4">SDE-1</td>
              <td className="px-6 py-4">12 Oct 2025</td>
              <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">In Progress</span></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">Microsoft</td>
              <td className="px-6 py-4">Intern</td>
              <td className="px-6 py-4">10 Oct 2025</td>
              <td className="px-6 py-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Rejected</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyApplications;