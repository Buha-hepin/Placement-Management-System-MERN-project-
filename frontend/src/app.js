import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- IMPORTS ---

// 1. Auth Page
import Login from './pages/Login'; // ✅ Path check kar lena (pages folder me hai na?)

// 2. Company Pages & Layout
import CompanyLayout from './components/CompanyLayout'; // ✅ Sidebar wala layout
import CompanyDashboard from './pages/Company/CompanyDashboard';
import PostJob from './pages/Company/PostJob';
import CompanyProfile from './pages/Company/CompanyProfile';
import CompanyApplicants from './pages/Company/CompanyApplicants';

// 3. Student Dashboard (Naya wala jo Tabs handle karega)
import StudentDashboard from './pages/Student/StudentDashboard'; 
// Note: Hame ab JobListings, MyApplications alag se import karne ki zarurat nahi hai App.js me.

// App.js me upar imports add kar:
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AllCompanies from './pages/Admin/AllCompanies';
import AllStudents from './pages/Admin/AllStudents';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- 1. LOGIN PAGE (Start yahi se hoga) --- */}
        <Route path="/" element={<Login />} />


        {/* --- 2. STUDENT SECTION --- */}
        {/* Sirf ek route kaafi hai. StudentDashboard khud andar Tabs switch karega */}
        <Route path="/student" element={<StudentDashboard />} />

        <Route path="/admin" element={<AdminLayout />}>
        <Route path="/admin" element={<AdminLayout />}>
        {/* Default to Dashboard */}
        <Route index element={<AdminDashboard />} /> 
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="companies" element={<AllCompanies />} />
        <Route path="students" element={<AllStudents />} />
        </Route>
        </Route>
  {/* Jobs wala page baad me banayenge */}
      
        

        {/* --- 3. COMPANY SECTION (Nested Routes) --- */}
        {/* Jab URL '/company' hoga, toh CompanyLayout (Sidebar) dikhega */}
        <Route path="/company" element={<CompanyLayout />}>
           
           {/* Default dashboard: /company/dashboard */}
           <Route path="dashboard" element={<CompanyDashboard />} />
           
           {/* Job Post karna: /company/post-job */}
           <Route path="post-job" element={<PostJob />} />
           
             {/* Applicants: /company/applicants/:jobId? */}
             <Route path="applicants/:jobId?" element={<CompanyApplicants />} />

           {/* Profile: /company/profile */}
           <Route path="profile" element={<CompanyProfile />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;