import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- ICONS (SVG) ---
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
const Briefcase = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);
const User = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const FileText = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>);
const LogOut = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const MapPin = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const Edit2 = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>);
const Upload = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const Download = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
// New Icon for Requirements
const CheckCircle = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("jobs"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Modal State
  const navigate = useNavigate();

  // --- STUDENT MOCK DATA (For Eligibility Check) ---
  const studentStats = {
    cgpa: 8.45,
    branch: "IT",
    backlogs: 0
  };

  // --- JOB DATA (Updated with Details & Criteria) ---
  const jobs = [
    { 
      id: 1, 
      company: "Google India", 
      role: "Software Engineer", 
      salary: "12 - 15 LPA", 
      location: "Bangalore", 
      type: "Full Time", 
      posted: "2 days ago", 
      description: "We are looking for a Software Engineer to join our team. You will be responsible for building scalable web applications using React and Node.js.",
      requirements: ["Strong knowledge of DSA", "Proficiency in React.js & Node.js", "Experience with MongoDB", "Good communication skills"],
      rounds: ["Online Coding Test", "Technical Interview 1", "Technical Interview 2", "HR Round"],
      deadline: "30th Dec 2025",
      minCGPA: 8.0,
      allowedBranches: ["IT", "CE", "ICT"]
    },
    { 
      id: 2, 
      company: "TCS Digital", 
      role: "System Engineer", 
      salary: "7.5 LPA", 
      location: "Pune", 
      type: "Full Time", 
      posted: "1 day ago", 
      description: "Hiring for Digital profile. Candidates will work on Cloud technologies and Python based automation scripts.",
      requirements: ["Basic knowledge of Python/Java", "Understanding of SQL", "Cloud Basics (AWS/Azure)", "No Active Backlogs"],
      rounds: ["Aptitude Test", "Coding Assessment", "Technical + HR Interview"],
      deadline: "5th Jan 2026",
      minCGPA: 6.5,
      allowedBranches: ["IT", "CE", "Mech", "EC"]
    },
    { 
      id: 3, 
      company: "InfoChips", 
      role: "Embedded Engineer", 
      salary: "5 LPA", 
      location: "Ahmedabad", 
      type: "Internship", 
      posted: "5 days ago", 
      description: "Internship opportunity for ECE/IT students interested in VLSI and Embedded Systems. PPO based on performance.",
      requirements: ["C/C++ Programming", "Microcontroller Basics", "Digital Electronics knowledge"],
      rounds: ["Technical Test", "Technical Interview"],
      deadline: "10th Jan 2026",
      minCGPA: 7.0,
      allowedBranches: ["EC", "Electrical"] // IT wala Eligible nahi hoga yahan
    },
  ];

  const handleLogout = () => navigate('/login');

  // --- Eligibility Checker Function ---
  const checkEligibility = (job) => {
    const isCGPAOk = studentStats.cgpa >= job.minCGPA;
    const isBranchOk = job.allowedBranches.includes(studentStats.branch);
    return isCGPAOk && isBranchOk;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* --- NEW FEATURE: JOB DETAILS MODAL (Popup) --- */}
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
                <XIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">₹ {selectedJob.salary}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full flex items-center gap-1"><MapPin size={14}/> {selectedJob.location}</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">{selectedJob.type}</span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5"><CheckCircle /></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

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
      {/* --- END MODAL --- */}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-tr from-cyan-700 to-blue-700 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Student Portal</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80"><XIcon /></button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => { setActiveTab("jobs"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "jobs" ? "bg-white/20 text-white shadow-lg" : "text-blue-100 hover:bg-white/10"}`}>
            <Briefcase /> <span>Browse Jobs</span>
          </button>
          <button onClick={() => { setActiveTab("applications"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "applications" ? "bg-white/20 text-white shadow-lg" : "text-blue-100 hover:bg-white/10"}`}>
            <FileText /> <span>My Applications</span>
          </button>
          <button onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "profile" ? "bg-white/20 text-white shadow-lg" : "text-blue-100 hover:bg-white/10"}`}>
            <User /> <span>My Profile</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-500/20 transition">
            <LogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><MenuIcon /></button>
            <h1 className="text-xl font-bold text-gray-800">
              {activeTab === 'jobs' && 'Latest Opportunities'}
              {activeTab === 'applications' && 'Application Status'}
              {activeTab === 'profile' && 'My Profile'}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">Welcome, Rahul</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md">R</div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* --- TAB 1: JOBS (With Eligibility Logic) --- */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 animate-fade-in">
              <div className="relative">
                <input type="text" placeholder="Search companies or roles..." className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Briefcase /></span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => {
                  const isEligible = checkEligibility(job); // Check eligibility here
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
                        <span className="flex items-center gap-1"><MapPin /> {job.location}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl mb-4">
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{job.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-400 font-medium">Posted {job.posted}</span>
                        
                        {/* Conditional Button Logic */}
                        <button 
                          disabled={!isEligible}
                          onClick={() => setSelectedJob(job)} 
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
          )}

          {/* --- TAB 2: APPLICATIONS --- */}
          {activeTab === 'applications' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">Application History</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                      <tr><th className="px-6 py-3">Company</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">Google India</td><td className="px-6 py-4">SDE-1</td><td className="px-6 py-4">12 Oct 2025</td><td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">In Progress</span></td></tr>
                      <tr className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">Microsoft</td><td className="px-6 py-4">Intern</td><td className="px-6 py-4">10 Oct 2025</td><td className="px-6 py-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Rejected</span></td></tr>
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* --- TAB 3: PROFILE (Tera wala favorite design) --- */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                
                {/* Cover Photo */}
                <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
                
                <div className="px-6 pb-6">
                  {/* Header: Avatar + Name + Edit Button */}
                  <div className="relative flex justify-between items-end -mt-6 mb-8">
                    {/* YAHAN DEKH: gap-8 aur -mt-6 tere hisaab se */}
                    <div className="flex items-end gap-8"> 
                      <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg z-10">
                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 border border-gray-200">RP</div>
                      </div>
                      <div className="mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">Rahul Patel</h2>
                        <p className="text-blue-600 font-medium">B.Tech - Information Technology</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition shadow-sm">
                      <Edit2 /> Edit Profile
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 border-b pb-2">Academic Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-500">Enrollment No.</p><p className="font-semibold text-gray-800">21IT056</p></div>
                        <div><p className="text-gray-500">Current CGPA</p><p className="font-semibold text-green-600 bg-green-50 inline-block px-2 rounded">8.45</p></div>
                        <div><p className="text-gray-500">Passing Year</p><p className="font-semibold text-gray-800">2026</p></div>
                        <div><p className="text-gray-500">Backlogs</p><p className="font-semibold text-gray-800">0</p></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 border-b pb-2">Contact Info</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">rahul.patel@ldrp.ac.in</span></div>
                        <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-800">+91 98765 43210</span></div>
                        <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Location</span><span className="font-medium text-gray-800">Gandhinagar, Gujarat</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Resume Section Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Skills */}
                    <div>
                      <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {["React.js", "Node.js", "MongoDB", "Python", "DSA", "Java"].map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 hover:bg-blue-100 transition cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resume Section */}
                    <div>
                      <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Resume / CV</h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <FileText />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Rahul_Resume.pdf</p>
                            <p className="text-xs text-gray-500">Uploaded 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download">
                             <Download />
                          </button>
                        </div>
                      </div>
                      <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-400 transition">
                        <Upload /> Upload New Resume
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}