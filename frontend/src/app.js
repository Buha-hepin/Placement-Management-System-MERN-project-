import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Layout Import kar (Jo Sidebar handle karega)
import CompanyLayout from './components/CompanyLayout';

// 2. Teeno Pages Import kar
import CompanyDashboard from './pages/Company/CompanyDashboard';
import PostJob from './pages/Company/PostJob';
import CompanyProfile from './pages/Company/CompanyProfile';

// Baaki pages (Login/Student wagera)
import Login from './Login'; // Check path logic based on your folder

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Login Page */}
        <Route path="/" element={<Login />} />

        {/* --- COMPANY SECTION (Ye hai main logic) --- */}
        {/* Jab URL '/company' hoga, toh Layout khulega */}
        <Route path="/company" element={<CompanyLayout />}>
           
           {/* Agar '/company/dashboard' hua to ye dikhega */}
           <Route path="dashboard" element={<CompanyDashboard />} />
           
           {/* Agar '/company/post-job' hua to ye dikhega */}
           <Route path="post-job" element={<PostJob />} />
           
           {/* Agar '/company/profile' hua to ye dikhega */}
           <Route path="profile" element={<CompanyProfile />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;