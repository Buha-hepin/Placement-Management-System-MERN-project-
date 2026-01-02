import React from 'react';
import { MapPin, Briefcase } from 'lucide-react'; // Icons import kar lena

const JobListings = ({ jobs, studentStats, onJobClick }) => {
  
  // Logic: Check agar student eligible hai
  const checkEligibility = (job) => {
    const isCGPAOk = studentStats.cgpa >= job.minCGPA;
    const isBranchOk = job.allowedBranches.includes(studentStats.branch);
    return isCGPAOk && isBranchOk;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <input type="text" placeholder="Search companies or roles..." className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase size={18} /></span>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => {
          const isEligible = checkEligibility(job);
          return (
            <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{job.company}</h3>
                  <p className="text-gray-500 text-sm">{job.role}</p>
                </div>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{job.type}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1"><span className="text-green-600 font-bold">₹</span> {job.salary}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4 bg-gray-50 p-3 rounded-xl">{job.description}</p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-400 font-medium">Posted {job.posted}</span>
                <button 
                  disabled={!isEligible}
                  onClick={() => onJobClick(job)} 
                  className={`px-6 py-2 rounded-lg font-semibold shadow-md transition transform hover:-translate-y-0.5 ${
                    isEligible 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isEligible ? "View & Apply" : "Not Eligible"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobListings;