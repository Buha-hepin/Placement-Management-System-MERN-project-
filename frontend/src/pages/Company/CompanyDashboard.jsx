import React, { useState } from 'react';
import { FiTrash2, FiSend, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function CompanyDashboard() {
  // Dummy Data for now
  const [postedJobs, setPostedJobs] = useState([
    { id: 1, role: "Senior Software Engineer", type: "Full Time", applicants: 45, salary: "18-24 LPA", date: "2025-12-28", status: "Active" }, 
    { id: 2, role: "UI/UX Intern", type: "Internship", applicants: 0, salary: "15k/mo", date: "2025-12-25", status: "Draft" }, 
  ]);

  const handleDeleteJob = (id) => {
    if(window.confirm("Are you sure?")) {
      setPostedJobs(postedJobs.filter(job => job.id !== id));
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">Manage Jobs 💼</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postedJobs.map((job) => (
          <div key={job.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition group ${job.status === 'Draft' ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {job.status}
              </span>
              <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"><FiTrash2 /></button>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{job.role}</h3>
            <p className="text-sm text-gray-500 mb-4">{job.type} • {job.salary}</p>
            
            {job.status === 'Draft' ? (
              <button className="w-full py-2 mt-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2">
                <FiSend /> Publish
              </button>
            ) : (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                  <span className="font-bold text-gray-900">{job.applicants} Applicants</span>
                  <button className="text-blue-600 hover:underline">View</button>
              </div>
            )}
          </div>
        ))}

        {/* Add New Job Card Button */}
        <Link to="/company/post-job" className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition h-auto min-h-[200px]">
          <FiPlus className="text-3xl mb-2" />
          <span className="font-bold">Post New Job</span>
        </Link>
      </div>
    </div>
  );
}