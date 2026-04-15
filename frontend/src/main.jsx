import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast'; 
import './index.css'

// --- AUTH PAGES ---
import Intro from './pages/Intro';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// --- STUDENT IMPORTS ---
import StudentDashboard from './pages/Student/StudentDashboard';

// --- COMPANY IMPORTS ---
import CompanyLayout from './components/CompanyLayout';
import CompanyDashboard from './pages/Company/CompanyDashboard';
import PostJob from './pages/Company/PostJob';
import CompanyProfile from './pages/Company/CompanyProfile';
import CompanyApplicants from './pages/Company/CompanyApplicants';
import CreateAptitudeTest from './pages/Company/CreateAptitudeTest';

// --- TEST ROUTES ---
import TakeAptitudeTest from './pages/Student/TakeAptitudeTest';

// --- ✅ ADMIN IMPORTS (Corrected) ---
// Duplicate hata diya aur sub-pages add kiye
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AllCompanies from './pages/Admin/AllCompanies';
import AllStudents from './pages/Admin/AllStudents';
import ApproveJobs from './pages/Admin/ApproveJobs';
import PlacementMaterialsAdmin from './pages/Admin/PlacementMaterialsAdmin';
import StudentMasterAdmin from './pages/Admin/StudentMasterAdmin';

const errorElement = (
  <div style={{padding:40, fontFamily:'sans-serif'}}>
    <h2 style={{color:'#c53030'}}>Page not found</h2>
    <p>The page you requested doesn't exist. Go back to <a href="/">home</a>.</p>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
     <>
      {/* Public Routes */}
      <Route path='/' element={<Intro/>} />
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/reset-password' element={<ResetPassword/>}/>
      
      {/* Student Route */}
      <Route path="/student" element={<StudentDashboard/>} />
      <Route path="/student/test/:testId" element={<TakeAptitudeTest/>} />
      
      {/* --- COMPANY ROUTES --- */}
      <Route path="/company" element={<CompanyLayout/>}>
          <Route path="dashboard" element={<CompanyDashboard/>} />
          <Route path="post-job" element={<PostJob/>} />
          <Route path="create-test" element={<CreateAptitudeTest/>} />
          <Route path="profile" element={<CompanyProfile/>} />
          <Route path="applicants/:jobId?" element={<CompanyApplicants/>} />
      </Route>
      {/* --- ADMIN ROUTES --- */}
      <Route path="/admin" element={<AdminLayout/>}>
          <Route index element={<AdminDashboard/>} /> 
          
          <Route path="dashboard" element={<AdminDashboard/>} />
          <Route path="companies" element={<AllCompanies/>} />
          <Route path="students" element={<AllStudents/>} />
          <Route path="student-master" element={<StudentMasterAdmin/>} />
          <Route path="approve-jobs" element={<ApproveJobs/>} />
            <Route path="materials" element={<PlacementMaterialsAdmin/>} />
          
      </Route>
        
      <Route path='*' element={errorElement} />
     </>
  )
);

const inferToastType = (message) => {
  const text = String(message || '').toLowerCase();
  if (text.includes('fail') || text.includes('error') || text.includes('unable')) return 'error';
  if (text.includes('warn') || text.includes('missing') || text.includes('required')) return 'warning';
  if (text.includes('success') || text.includes('done') || text.includes('approved') || text.includes('uploaded')) return 'success';
  return 'info';
};

window.appAlert = (message) => {
  const safeMessage = String(message || 'Notification');
  const type = inferToastType(safeMessage);
  const palette = {
    success: {
      icon: '✓',
      title: 'Success',
      card: 'border-emerald-200 bg-emerald-50',
      iconWrap: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-900'
    },
    error: {
      icon: '!',
      title: 'Error',
      card: 'border-rose-200 bg-rose-50',
      iconWrap: 'bg-rose-100 text-rose-700',
      text: 'text-rose-900'
    },
    warning: {
      icon: '!',
      title: 'Warning',
      card: 'border-amber-200 bg-amber-50',
      iconWrap: 'bg-amber-100 text-amber-700',
      text: 'text-amber-900'
    },
    info: {
      icon: 'i',
      title: 'Info',
      card: 'border-sky-200 bg-sky-50',
      iconWrap: 'bg-sky-100 text-sky-700',
      text: 'text-sky-900'
    }
  };

  const active = palette[type] || palette.info;
  const duration = type === 'error' ? 5500 : 4500;

  toast.custom(
    (t) => (
      <div
        className={`w-[92vw] max-w-md rounded-2xl border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-all ${
          t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        } ${active.card}`}
      >
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold ${active.iconWrap}`}>
            {active.icon}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${active.text}`}>{active.title}</p>
            <p className={`text-sm mt-0.5 leading-relaxed ${active.text}`}>{safeMessage}</p>
          </div>
        </div>
      </div>
    ),
    { duration, position: 'top-center' }
  );
};

window.appConfirm = (input) => {
  const options = typeof input === 'string'
    ? { title: 'Please Confirm', message: input, confirmText: 'Yes, Continue', cancelText: 'Cancel' }
    : {
        title: input?.title || 'Please Confirm',
        message: input?.message || 'Are you sure you want to continue?',
        confirmText: input?.confirmText || 'Yes, Continue',
        cancelText: input?.cancelText || 'Cancel'
      };

  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="w-[92vw] max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-start gap-3">
            <div className="text-xl">⚠️</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{options.title}</p>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{options.message}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {options.cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {options.confirmText}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  });
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          style: {
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 14px 34px rgba(2, 6, 23, 0.14)',
            padding: '14px 16px'
          },
          success: {
            style: {
              border: '1px solid #86efac',
              background: '#f0fdf4'
            }
          },
          error: {
            style: {
              border: '1px solid #fca5a5',
              background: '#fff1f2'
            }
          }
        }}
      />
      <RouterProvider router={router}/>
  </React.StrictMode>,
)