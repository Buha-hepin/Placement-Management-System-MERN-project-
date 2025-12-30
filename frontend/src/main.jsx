import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css'

import Intro from './pages/Intro';
import Register from './pages/Register';
import Login from './pages/Login';
import Admin_Dashboard from './pages/Admin_Dashboard';
import Student_dashboard from './pages/Student_dashboard';
import Company_Dashboard from './pages/Company_Dashboard';

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
        <Route path='/admin' element={<Admin_Dashboard/>} />
        <Route path="/student" element={<Student_dashboard/>} />
        <Route path="/company-dashboard" element={<Company_Dashboard/>} />
        <Route path='*' element={<ErrorPage/>} />
     </>
    
  )
);


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <RouterProvider router={router}/>
    </>
  </React.StrictMode>,
)
