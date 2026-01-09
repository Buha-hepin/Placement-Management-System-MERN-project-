import React from 'react';
import { Edit2, FileText, Upload, Download } from 'lucide-react'; 

const StudentProfile = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
        
        <div className="px-6 pb-6">
          {/* Avatar & Header */}
          <div className="relative flex justify-between items-end -mt-6 mb-8">
            <div className="flex items-end gap-8"> 
              <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg z-10">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 border border-gray-200">RP</div>
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold text-gray-900">Rahul Patel</h2>
                <p className="text-blue-600 font-medium">B.Tech - Information Technology</p>
              </div>
            </div>
            <button  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition shadow-sm">
              <Edit2 size={16}/> Edit Profile
            </button>
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-2">Academic Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Enrollment No.</p><p className="font-semibold text-gray-800">21IT056</p></div>
                <div><p className="text-gray-500">Current CGPA</p><p className="font-semibold text-green-600 bg-green-50 inline-block px-2 rounded">8.45</p></div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
               <h3 className="font-bold text-gray-900 border-b pb-2">Contact Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">rahul.patel@ldrp.ac.in</span></div>
                 <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-800">+91 98765 43210</span></div>
               </div>
            </div>
          </div>

          {/* Skills & Resume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Resume UI */}
             <div>
               <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Resume</h3>
               <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-red-100 p-2 rounded-lg text-red-600"><FileText size={20}/></div>
                   <div><p className="text-sm font-semibold text-gray-800">Rahul_Resume.pdf</p></div>
                 </div>
               </div>
             </div>
             {/* Skills UI */}
             <div>
                <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node", "MongoDB"].map(s => <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{s}</span>)}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;