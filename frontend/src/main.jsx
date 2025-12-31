import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css'

// --- Pages Imports ---
import Intro from './pages/Intro';
import Register from './pages/Register';
import Login from './pages/Login';
import Admin_Dashboard from './pages/Admin_Dashboard';
import Student_dashboard from './pages/Student_dashboard';

// --- COMPANY IMPORTS (Ye Change Hua Hai) ---
import CompanyLayout from './components/CompanyLayout'; // Layout import kiya
import CompanyDashboard from './pages/Company/CompanyDashboard'; // Dashboard file
import PostJob from './pages/Company/PostJob'; // Post Job file
import CompanyProfile from './pages/Company/CompanyProfile'; // Profile file
import CompanyApplicants from './pages/Company/CompanyApplicants';

function ErrorPage() {
  return (
    <div style={{padding:40,fontFamily:'sans-serif'}}>
      <h2 style={{color:'#c53030'}}>Page not found</h2>
      <p>The page you requested doesn't exist. Go back to <a href="/">home</a>.</p>
    </div>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
     <>
      <Route path='/' element={<Intro/>} />
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      
      {/* Admin Route */}
      <Route path='/admin' element={<Admin_Dashboard/>} />
      
      {/* Student Route */}
      <Route path="/student" element={<Student_dashboard/>} />

      {/* --- COMPANY ROUTES (Nested Routing) --- */}
      {/* Jab '/company' khulega to Layout load hoga */}
      <Route path="/company" element={<CompanyLayout/>}>
          
          {/* Default page (Dashboard) */}
          <Route path="dashboard" element={<CompanyDashboard/>} />
          
          {/* Post Job Page */}
          <Route path="post-job" element={<PostJob/>} />
          
          {/* Profile Page */}
          <Route path="profile" element={<CompanyProfile/>} />
          
          <Route path="applicants" element={<CompanyApplicants/>} />
          
      </Route>
        
      <Route path='*' element={<ErrorPage/>} />
     </>
  )
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <RouterProvider router={router}/>
  </React.StrictMode>,
)