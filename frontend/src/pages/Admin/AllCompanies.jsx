import React, { useState } from 'react';
import { Check, Trash2, Search, Building } from 'lucide-react';

const AllCompanies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Tata Consultancy Services', email: 'hr@tcs.com', status: 'Pending', location: 'Mumbai' },
    { id: 2, name: 'Wipro Technologies', email: 'careers@wipro.com', status: 'Active', location: 'Bangalore' },
    { id: 3, name: 'Google India', email: 'recruiter@google.com', status: 'Pending', location: 'Hyderabad' },
  ]);

  const handleApprove = (id) => {
    const updated = companies.map(c => c.id === id ? { ...c, status: 'Active' } : c);
    setCompanies(updated);
    // Add toast success here
  };

  const handleDelete = (id) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
       
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Companies</h2>
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search Company..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4 pl-6">Company Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition">
                <td className="p-4 pl-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {company.name.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-800">{company.name}</span>
                </td>
                <td className="p-4 text-gray-600">{company.email}</td>
                <td className="p-4 text-gray-600">{company.location}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    company.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {company.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {company.status === 'Pending' && (
                    <button 
                      onClick={() => handleApprove(company.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition" 
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(company.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition" 
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllCompanies;