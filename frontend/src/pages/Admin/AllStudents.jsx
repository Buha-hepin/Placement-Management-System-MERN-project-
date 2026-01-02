import React, { useState } from 'react';
import { Search, Eye, Trash2, Ban, X, Mail, Phone, BookOpen, User } from 'lucide-react';

const AllStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null); // Modal State
  const [searchTerm, setSearchTerm] = useState("");

  // --- DUMMY DATA ---
  const students = [
    { id: 1, name: 'Rahul Patel', enrollment: '21IT056', email: 'rahul@example.com', phone: '9876543210', branch: 'IT', cgpa: 8.45, skills: ['React', 'Node.js', 'Python'], status: 'Active' },
    { id: 2, name: 'Priya Sharma', enrollment: '21CE012', email: 'priya@example.com', phone: '9123456789', branch: 'CE', cgpa: 9.10, skills: ['Java', 'SQL', 'AWS'], status: 'Placed' },
    { id: 3, name: 'Amit Verma', enrollment: '21IT005', email: 'amit@example.com', phone: '9988776655', branch: 'IT', cgpa: 6.50, skills: ['C++', 'HTML/CSS'], status: 'Active' },
  ];

  // Functions
  const handleDelete = () => {
    alert(`Deleting student: ${selectedStudent.name}`);
    setSelectedStudent(null);
  };

  const handleBlock = () => {
    alert(`Blocking student: ${selectedStudent.name}`);
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Students</h2>
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search Enrollment or Name..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4 pl-6">Enrollment</th>
              <th className="p-4">Name</th>
              <th className="p-4">Branch</th>
              <th className="p-4">CGPA</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.enrollment.includes(searchTerm)).map((student) => (
              <tr 
                key={student.id} 
                className="hover:bg-blue-50/50 transition cursor-pointer"
                onClick={() => setSelectedStudent(student)} // Row Click -> Open Modal
              >
                <td className="p-4 pl-6 font-mono text-gray-600">{student.enrollment}</td>
                <td className="p-4 font-bold text-gray-800">{student.name}</td>
                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">{student.branch}</span></td>
                <td className="p-4 font-semibold text-gray-700">{student.cgpa}</td>
                <td className="p-4 text-center">
                  <button className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 STUDENT PROFILE MODAL (Popup) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                   {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-blue-100 text-sm">{selectedStudent.enrollment} | {selectedStudent.branch}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Mail size={12}/> Email</p>
                  <p className="font-medium text-gray-800 text-sm truncate">{selectedStudent.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Phone size={12}/> Phone</p>
                  <p className="font-medium text-gray-800 text-sm">{selectedStudent.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><BookOpen size={12}/> Skills</p>
                 <div className="flex flex-wrap gap-2 mt-2">
                   {selectedStudent.skills.map((skill, i) => (
                     <span key={i} className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-medium shadow-sm">
                       {skill}
                     </span>
                   ))}
                 </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-blue-800 font-semibold text-sm">Current CGPA</span>
                <span className="text-2xl font-bold text-blue-600">{selectedStudent.cgpa}</span>
              </div>
            </div>

            {/* Modal Footer (Danger Zone) */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3 justify-end">
               <button onClick={handleBlock} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-200 transition">
                 <Ban size={18}/> Block
               </button>
               <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition">
                 <Trash2 size={18}/> Delete
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AllStudents;