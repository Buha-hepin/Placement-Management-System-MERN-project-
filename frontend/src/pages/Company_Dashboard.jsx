import React, { useState } from 'react';
// npm install react-icons
import { 
  FiBriefcase, FiUsers, FiSettings, FiLogOut, FiPlus, FiCalendar, FiBell, FiCheckCircle, FiMapPin, FiDollarSign, FiGlobe, FiMail, FiDownload, FiSearch, FiTrash2, FiEdit3, FiEye, FiSave, FiSend, FiMenu, FiX
} from 'react-icons/fi'; 

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('postJob');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State

  // --- 1. STATE: POST JOB FORM ---
  const [jobDetails, setJobDetails] = useState({
    companyName: 'Google India', role: '', description: '', salary: '', location: '', type: 'Full Time', deadline: ''
  });
  
  // Toggle for Preview only
  const [isPublishToggleOn, setIsPublishToggleOn] = useState(false); 
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // --- 2. STATE: COMPANY PROFILE ---
  const [companyProfile, setCompanyProfile] = useState({
    name: 'Google India', website: 'https://careers.google.com', location: 'Bangalore, India', email: 'hr@google.com', founded: '1998', size: '10,000+ Employees',
    about: 'Google is an American multinational technology company that specializes in Internet-related services and products.'
  });

  // --- 3. DATA: MANAGE JOBS (Draft Logic Added) ---
  const [postedJobs, setPostedJobs] = useState([
    { id: 1, role: "Senior Software Engineer", type: "Full Time", applicants: 45, salary: "18-24 LPA", date: "2025-12-28", status: "Active" }, 
    { id: 2, role: "UI/UX Intern", type: "Internship", applicants: 0, salary: "15k/mo", date: "2025-12-25", status: "Draft" }, 
  ]);

  // --- 4. DATA: APPLICANTS ---
  const [applicants, setApplicants] = useState([
    { id: 101, name: "Rahul Patel", role: "SDE-1", cgpa: "8.45", status: "Pending", date: "29 Dec", email: "rahul@ldrp.ac.in" },
    { id: 102, name: "Priya Sharma", role: "UI/UX Intern", cgpa: "9.10", status: "Shortlisted", date: "28 Dec", email: "priya@ldrp.ac.in" },
    { id: 103, name: "Amit Kumar", role: "SDE-1", cgpa: "7.20", status: "Rejected", date: "27 Dec", email: "amit@ldrp.ac.in" },
  ]);

  // --- HANDLERS ---
  const handleInputChange = (e) => setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
  const handleProfileChange = (e) => setCompanyProfile({ ...companyProfile, [e.target.name]: e.target.value });
  
  const handleToggleChange = () => {
    setIsPublishToggleOn(!isPublishToggleOn);
  };

  // Logic: Save to List as Draft
  const handleSaveDraft = () => {
    const newJob = { 
      id: postedJobs.length + 1, 
      ...jobDetails, 
      applicants: 0, 
      date: new Date().toISOString().split('T')[0], 
      status: "Draft" 
    };
    setPostedJobs([...postedJobs, newJob]);
    alert("Job Saved as Draft! Check 'Manage Jobs' tab.");
    setJobDetails({ companyName: 'Google India', role: '', description: '', salary: '', location: '', type: 'Full Time', deadline: '' }); // Reset
  };

  // Logic: Publish Directly
  const handlePublishSubmit = () => {
    const newJob = { 
      id: postedJobs.length + 1, 
      ...jobDetails, 
      applicants: 0, 
      date: new Date().toISOString().split('T')[0], 
      status: "Active" 
    };
    setPostedJobs([...postedJobs, newJob]);
    setShowPublishModal(false); 
    alert("✅ Job Published Successfully!");
    setJobDetails({ companyName: 'Google India', role: '', description: '', salary: '', location: '', type: 'Full Time', deadline: '' }); // Reset
  };

  // Logic: Convert Draft to Active
  const handleActivateJob = (id) => {
    if(window.confirm("Publish this draft job to students?")) {
      setPostedJobs(postedJobs.map(job => job.id === id ? { ...job, status: "Active" } : job));
    }
  };

  const handleDeleteJob = (id) => {
    if(window.confirm("Are you sure you want to delete this job posting?")) {
      setPostedJobs(postedJobs.filter(job => job.id !== id));
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    setApplicants(applicants.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* --- MOBILE OVERLAY (Black background when menu is open) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* --- SIDEBAR (Responsive) --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-tr from-cyan-700 to-blue-700 text-white flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Company</h1>
              <p className="text-xs text-blue-100 opacity-80">Admin Panel</p>
            </div>
          </div>
          {/* Close Button for Mobile */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80"><FiX size={24} /></button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
          <SidebarItem icon={<FiPlus />} label="Post New Job" active={activeTab === 'postJob'} onClick={() => {setActiveTab('postJob'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<FiBriefcase />} label="Manage Jobs" active={activeTab === 'manageJobs'} onClick={() => {setActiveTab('manageJobs'); setIsSidebarOpen(false);}} />
          <SidebarItem icon={<FiSettings />} label="Company Profile" active={activeTab === 'profile'} onClick={() => {setActiveTab('profile'); setIsSidebarOpen(false);}} /> 
          
          <p className="px-4 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 mt-6">Analytics</p>
          <SidebarItem icon={<FiUsers />} label="Applicants" active={activeTab === 'applicants'} onClick={() => {setActiveTab('applicants'); setIsSidebarOpen(false);}} badge={applicants.length} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-100 hover:bg-red-500/20 transition">
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        
        {/* Mobile Header (Hamburger) */}
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-lg shadow-sm text-gray-700"><FiMenu size={24} /></button>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {activeTab === 'postJob' && "Let's Hire! 🚀"}
              {activeTab === 'manageJobs' && "Manage Jobs 💼"}
              {activeTab === 'profile' && "Company Profile 🏢"}
              {activeTab === 'applicants' && "Candidate Applications 👥"}
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 w-fit">
             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
             <span className="text-xs font-bold text-green-700">System Online</span>
          </div>
        </header>

        {/* --- TAB 1: POST JOB (Responsive Grid) --- */}
        {activeTab === 'postJob' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
            <div className="xl:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <InputGroup label="Job Role / Title" name="role" value={jobDetails.role} onChange={handleInputChange} placeholder="e.g. Senior Software Engineer" />
                  <InputGroup label="Location" name="location" value={jobDetails.location} onChange={handleInputChange} placeholder="e.g. Bangalore" icon={<FiMapPin />} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                   <InputGroup label="Salary Package" name="salary" value={jobDetails.salary} onChange={handleInputChange} placeholder="e.g. 18 - 24 LPA" icon={<FiDollarSign />} />
                   <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {['Full Time', 'Internship', 'Contract'].map((type) => (
                          <button key={type} onClick={() => setJobDetails({...jobDetails, type: type})} className={`py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all border ${jobDetails.type === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>{type}</button>
                        ))}
                      </div>
                   </div>
                </div>
                <textarea name="description" value={jobDetails.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Job Description..."></textarea>
              </section>
              
              {/* Action Buttons (Draft vs Publish) */}
              <div className="flex flex-col md:flex-row gap-4">
                 <button onClick={handleSaveDraft} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                   <FiSave /> Save as Draft
                 </button>
                 <button onClick={() => {setShowPublishModal(true); setAlertMessage(`Opening: ${jobDetails.role} at ${jobDetails.companyName}`);}} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                   <FiSend /> Publish Now
                 </button>
              </div>
            </div>
            
            {/* Preview Card */}
            <div className="xl:col-span-1">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Live Preview</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-400">Toggle View</span>
                    <input type="checkbox" className="accent-blue-600" checked={isPublishToggleOn} onChange={handleToggleChange} />
                  </label>
               </div>
               <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition-all ${isPublishToggleOn ? 'ring-2 ring-blue-500 shadow-lg' : 'opacity-70 grayscale'}`}>
                  {!isPublishToggleOn && <div className="text-center mb-4"><span className="bg-gray-800 text-white px-3 py-1 rounded text-xs font-bold">Draft Mode</span></div>}
                  <h3 className="text-xl font-bold text-gray-900">{jobDetails.companyName}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-4">{jobDetails.role || 'Job Role'}</p>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4">{jobDetails.description || 'Description will appear here...'}</p>
                  <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">Apply Now</button>
               </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: MANAGE JOBS (Draft & Active Logic) --- */}
        {activeTab === 'manageJobs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {postedJobs.map((job) => (
              <div key={job.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition group ${job.status === 'Draft' ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {job.status}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"><FiTrash2 /></button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{job.role}</h3>
                <p className="text-sm text-gray-500 mb-4">{job.type} • {job.salary}</p>
                
                {job.status === 'Draft' ? (
                  <button onClick={() => handleActivateJob(job.id)} className="w-full py-2 mt-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <FiSend /> Publish to Students
                  </button>
                ) : (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                     <span className="font-bold text-gray-900">{job.applicants} Applicants</span>
                     <button className="text-blue-600 hover:underline">View</button>
                  </div>
                )}
              </div>
            ))}
            {/* Add New Job Card */}
            <button onClick={() => setActiveTab('postJob')} className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition h-auto min-h-[200px]">
              <FiPlus className="text-3xl mb-2" />
              <span className="font-bold">Post New Job</span>
            </button>
          </div>
        )}

        {/* --- TAB 3: COMPANY PROFILE --- */}
        {activeTab === 'profile' && (
           <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
             <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900"></div>
             <div className="px-4 md:px-8 pb-8">
               <div className="relative flex flex-col md:flex-row justify-between items-end md:items-end -mt-10 mb-8 gap-4">
                 <div className="flex items-end gap-4 md:gap-6">
                   <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600">G</div>
                   <div className="mb-1">
                     <h2 className="text-xl md:text-2xl font-bold text-gray-900">{companyProfile.name}</h2>
                     <a href={companyProfile.website} className="text-blue-600 text-sm hover:underline flex items-center gap-1"><FiGlobe/> {companyProfile.website}</a>
                   </div>
                 </div>
                 <button onClick={() => alert("Changes Saved!")} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700">Save Changes</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 <div className="space-y-4">
                   <InputGroup label="Company Name" name="name" value={companyProfile.name} onChange={handleProfileChange} />
                   <InputGroup label="Headquarters Location" name="location" value={companyProfile.location} onChange={handleProfileChange} icon={<FiMapPin />} />
                   <InputGroup label="Contact Email" name="email" value={companyProfile.email} onChange={handleProfileChange} icon={<FiMail />} />
                 </div>
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="Founded Year" name="founded" value={companyProfile.founded} onChange={handleProfileChange} />
                      <InputGroup label="Company Size" name="size" value={companyProfile.size} onChange={handleProfileChange} />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">About Company</label>
                     <textarea name="about" value={companyProfile.about} onChange={handleProfileChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"></textarea>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* --- TAB 4: APPLICANTS (Responsive Table) --- */}
        {activeTab === 'applicants' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg text-gray-800">Recent Applications</h3>
              <div className="relative w-full md:w-auto">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search student..." className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            {/* Scrollable Table for Mobile */}
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
        )}
      </main>

      {/* --- MODAL (PUBLISH POPUP) --- */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-bounce-in-up p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4"><FiBell className="text-3xl animate-wiggle"/></div>
            <h3 className="text-xl font-bold mb-2">Publish & Notify?</h3>
            <p className="text-gray-500 text-sm mb-6">This job will be visible to students instantly.</p>
            <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="w-full p-3 border rounded-xl mb-6 text-sm bg-gray-50" rows="3"></textarea>
            <div className="flex gap-3">
               <button onClick={() => {setShowPublishModal(false);}} className="flex-1 py-2.5 border rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
               <button onClick={handlePublishSubmit} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Confirm Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---
const SidebarItem = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/20 text-white shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}>
    <div className="flex items-center gap-3"><span className="text-lg">{icon}</span><span className="font-medium text-sm">{label}</span></div>
    {badge && <span className="bg-white text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

const InputGroup = ({ label, name, value, onChange, placeholder, icon }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm ${icon ? 'pl-10' : ''}`} />
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>}
    </div>
  </div>
);