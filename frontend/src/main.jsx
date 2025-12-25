import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css'

import Intro from './pages/Intro';
import Register from './pages/Register';

const router = createBrowserRouter(
  createRoutesFromElements(
    
     <>
      <Route path='/' element={<Intro/>} />
      <Route path='/register' element={<Register/>}/>
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
