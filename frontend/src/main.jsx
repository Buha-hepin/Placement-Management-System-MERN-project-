import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import './index.css'

// --- AUTH PAGES ---
import Intro from './pages/Intro';
import Register from './pages/Register';
import Login from './pages/Login';

// --- STUDENT IMPORTS ---
import StudentDashboard from './pages/Student/StudentDashboard';

// --- COMPANY IMPORTS ---
import CompanyLayout from './components/CompanyLayout';
import CompanyDashboard from './pages/Company/CompanyDashboard';
import PostJob from './pages/Company/PostJob';
import CompanyProfile from './pages/Company/CompanyProfile';
import CompanyApplicants from './pages/Company/CompanyApplicants';

// --- ✅ ADMIN IMPORTS (Corrected) ---
// Duplicate hata diya aur sub-pages add kiye
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AllCompanies from './pages/Admin/AllCompanies';
import AllStudents from './pages/Admin/AllStudents';

// Error Page
function ErrorPage() {
  return (
    <div style={{padding:40, fontFamily:'sans-serif'}}>
      <h2 style={{color:'#c53030'}}>Page not found</h2>
      <p>The page you requested doesn't exist. Go back to <a href="/">home</a>.</p>
    </div>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
     <>
      {/* Public Routes */}
      <Route path='/' element={<Intro/>} />
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      
      {/* Student Route */}
      <Route path="/student" element={<StudentDashboard/>} />
      
      {/* --- COMPANY ROUTES --- */}
      <Route path="/company" element={<CompanyLayout/>}>
          <Route path="dashboard" element={<CompanyDashboard/>} />
          <Route path="post-job" element={<PostJob/>} />
          <Route path="profile" element={<CompanyProfile/>} />
          <Route path="applicants" element={<CompanyApplicants/>} />
      </Route>

      {/* --- ✅ ADMIN ROUTES (Fixed Structure) --- */}
      {/* Isko open-close tag banaya taaki andar pages aa sakein */}
      <Route path="/admin" element={<AdminLayout/>}>
          
          {/* Default: Agar koi '/admin' khule to Dashboard dikhe */}
          <Route index element={<AdminDashboard/>} /> 
          
          <Route path="dashboard" element={<AdminDashboard/>} />
          <Route path="companies" element={<AllCompanies/>} />
          <Route path="students" element={<AllStudents/>} />
          
      </Route>
        
      <Route path='*' element={<ErrorPage/>} />
     </>
  )
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Toaster position="top-center" />
      <RouterProvider router={router}/>
  </React.StrictMode>,
)