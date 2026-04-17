import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { getStudentAvailableTests } from '../../services/api';

export default function StudentAptitudeTests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const studentId = sessionStorage.getItem('studentId');

  useEffect(() => {
    if (!studentId) {
      setError('Student not logged in');
      setLoading(false);
      return;
    }

    getStudentAvailableTests(studentId)
      .then(res => {
        setTests(res?.data || []);
      })
      .catch(err => {
        setError(err.message || 'Failed to load tests');
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleStartTest = (testId) => {
    navigate(`/student/test/${testId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <FiCheckCircle className="text-4xl text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-lg">{error || 'No aptitude tests available right now'}</p>
        {!error && <p className="text-gray-500 text-sm mt-2">Check back later for new tests from companies</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {tests.map((test) => (
          <div key={test._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{test.testName}</h3>
                <p className="text-sm text-gray-600">{test.companyName}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {test.totalQuestions} Questions
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FiClock size={18} />
                <span className="text-sm">{test.timeLimit} min</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiTrendingUp size={18} />
                <span className="text-sm">Pass: {test.scoring?.passingScore ?? test.passingScore}%</span>
              </div>
              <div className="text-sm text-gray-600">
                {test.attempt ? (
                  <span className={`text-xs font-semibold ${test.attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                    {test.attempt.passed ? `Passed (${test.attempt.percentage}%)` : `Failed (${test.attempt.percentage}%)`}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Not attempted</span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleStartTest(test._id)}
              disabled={test.attempt?.status === 'evaluated'}
              className={`w-full py-2 font-semibold rounded-lg transition ${test.attempt?.status === 'evaluated' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'}`}
            >
              {test.attempt?.status === 'evaluated' ? 'Already Attempted' : 'Start Test →'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
