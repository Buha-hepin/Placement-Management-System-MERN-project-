import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, Briefcase, User, FileText, LogOut, MapPin, CheckCircle } from 'lucide-react'; // Ya fir apne icons wali file import kar lena
// NOTE: Agar lucide-react nahi hai, toh wahi purane SVG icons niche paste kar dena (maine space bachane ke liye hataye hain)

// Import Sub-Pages
import JobListings from './JobListings';
import MyApplications from './MyApplications';
import StudentProfile from './StudentProfile';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("jobs"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Modal State
  const navigate = useNavigate();

  // --- MOCK DATA (Yahan rakhna best hai taaki props se pass kar sakein) ---
  const studentStats = { cgpa: 8.45, branch: "IT", backlogs: 0 };

  const jobs = [
    { 
      id: 1, company: "Google India", role: "Software Engineer", salary: "12 - 15 LPA", location: "Bangalore", type: "Full Time", posted: "2 days ago", 
      description: "Building scalable web applications using React and Node.js.",
      requirements: ["DSA", "React.js & Node.js", "MongoDB"], rounds: ["Coding Test", "Interviews"], deadline: "30th Dec 2025", minCGPA: 8.0, allowedBranches: ["IT", "CE", "ICT"]
    },
    { 
      id: 2, company: "TCS Digital", role: "System Engineer", salary: "7.5 LPA", location: "Pune", type: "Full Time", posted: "1 day ago", 
      description: "Cloud technologies and Python automation.",
      requirements: ["Python/Java", "SQL", "No Backlogs"], rounds: ["Aptitude", "Coding", "Interview"], deadline: "5th Jan 2026", minCGPA: 6.5, allowedBranches: ["IT", "CE", "Mech", "EC"]
    },
    // Aur jobs add kar sakta hai
  ];

  const handleLogout = () => navigate('/login');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && ( <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div> )}

      {/* --- JOB DETAILS MODAL (Popup) --- */}
      {/* Isko alag file me bhi daal sakte hain, par abhi yahi theek hai */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedJob.company}</h2>
                <p className="text-sm text-gray-500">{selectedJob.role}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <XIcon size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Tags: Salary, Location, Type */}
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">₹ {selectedJob.salary}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full flex items-center gap-1"><MapPin size={14}/> {selectedJob.location}</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">{selectedJob.type}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements List */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5"><CheckCircle size={16} /></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selection Process */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Selection Process</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.rounds.map((round, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50">
                        {index + 1}. {round}
                      </span>
                      {index !== selectedJob.rounds.length - 1 && <span className="text-gray-300">→</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadline Alert */}
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center gap-2 text-orange-800 text-sm font-medium">
                <span>⚠️ Deadline:</span><span>{selectedJob.deadline}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setSelectedJob(null)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition">Cancel</button>
              <button onClick={() => alert(`Applied Successfully!`)} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition">Confirm Apply</button>
            </div>
          </div>
        </div>
      )}    

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-tr from-cyan-700 to-blue-700 text-white rounded-tr-2xl rounded-br-2xl  transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Student Portal</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80">✕</button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab("jobs")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "jobs" ? "bg-white/20 shadow-lg" : "hover:bg-white/10"}`}>
            <Briefcase size={20}/> <span>Browse Jobs</span>
          </button>
          <button onClick={() => setActiveTab("applications")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "applications" ? "bg-white/20 shadow-lg" : "hover:bg-white/10"}`}>
            <FileText size={20}/> <span>My Applications</span>
          </button>
          <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "profile" ? "bg-white/20 shadow-lg" : "hover:bg-white/10"}`}>
            <User size={20}/> <span>My Profile</span>
          </button>
        </nav>
        <div className="p-4 border-t border-white/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-500/20"><LogOut size={20}/> <span>Logout</span></button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><MenuIcon /></button>
           <h1 className="text-xl font-bold text-gray-800">
             {activeTab === 'jobs' && 'Latest Opportunities'}
             {activeTab === 'applications' && 'Application Status'}
             {activeTab === 'profile' && 'My Profile'}
           </h1>
           <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">R</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {activeTab === 'jobs' && (
            <JobListings 
              jobs={jobs} 
              studentStats={studentStats} 
              onJobClick={setSelectedJob} 
            />
          )}

          {activeTab === 'applications' && <MyApplications />}
          
          {activeTab === 'profile' && <StudentProfile />}

        </main>
      </div>
    </div>
  );
}