import React, { useEffect, useState } from 'react';
import { FiUpload, FiSettings, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { createAptitudeTest, getCompanyJobs } from '../../services/api';

const isValidMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

const resolveCompanyId = () => {
  const direct = String(localStorage.getItem('companyId') || '').trim();
  if (isValidMongoId(direct)) return direct;

  try {
    const cached = JSON.parse(localStorage.getItem('companyData') || '{}');
    const cachedId = String(cached?._id || '').trim();
    if (isValidMongoId(cachedId)) return cachedId;
  } catch {
    // ignore malformed cached JSON
  }

  return '';
};

export default function CreateAptitudeTest() {
  const [testData, setTestData] = useState({
    testName: '',
    testDescription: '',
    timeLimit: 60,
    jobId: null,
    totalMarks: 100,
    marksPerQuestion: 1,
    passingScore: 60,
    maxAttempts: 1,
    minCGPA: 0,
    shuffleQuestions: true,
    negativeMarking: {
      enabled: false,
      marksPerWrong: 0.5
    },
    answerKey: ''
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const companyId = resolveCompanyId();

  useEffect(() => {
    const loadCompanyJobs = async () => {
      if (!companyId) return;
      try {
        setJobsLoading(true);
        localStorage.setItem('companyId', companyId);
        const res = await getCompanyJobs(companyId);
        setJobs(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to load company jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };
    loadCompanyJobs();
  }, [companyId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsedNumber = value === '' ? '' : Number(value);
    
    if (name.includes('negativeMarking')) {
      const key = name.split('.')[1];
      setTestData({
        ...testData,
        negativeMarking: {
          ...testData.negativeMarking,
          [key]: type === 'checkbox' ? checked : parsedNumber
        }
      });
    } else {
      setTestData({
        ...testData,
        [name]: type === 'number' ? parsedNumber : value
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Please select a valid PDF file' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!testData.testName) {
      setMessage({ type: 'error', text: 'Test name is required' });
      return;
    }

    if (!pdfFile) {
      setMessage({ type: 'error', text: 'Please upload a PDF file' });
      return;
    }

    if (!testData.answerKey) {
      setMessage({ type: 'error', text: 'Answer key is required' });
      return;
    }

    // Parse answer key and validate
    const answerArray = testData.answerKey
      .split(',')
      .map(ans => ans.trim().toUpperCase())
      .filter(ans => ans);

    if (answerArray.length === 0) {
      setMessage({ type: 'error', text: 'Please provide valid answers (A, B, C, or D)' });
      return;
    }

    if (!answerArray.every(ans => ['A', 'B', 'C', 'D'].includes(ans))) {
      setMessage({ type: 'error', text: 'All answers must be A, B, C, or D' });
      return;
    }

    try {
      setLoading(true);
      if (!companyId) {
        setMessage({ type: 'error', text: 'Please login as company first' });
        return;
      }

      localStorage.setItem('companyId', companyId);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('testName', testData.testName);
      formData.append('testDescription', testData.testDescription);
      formData.append('timeLimit', testData.timeLimit);
      formData.append('totalMarks', testData.totalMarks);
      formData.append('marksPerQuestion', testData.marksPerQuestion);
      formData.append('passingScore', testData.passingScore);
      formData.append('maxAttempts', testData.maxAttempts);
      formData.append('minCGPA', testData.minCGPA);
      formData.append('shuffleQuestions', testData.shuffleQuestions);
      formData.append('answerKey', JSON.stringify(answerArray));
      formData.append('negativeMarking', JSON.stringify(testData.negativeMarking));
      formData.append('jobId', testData.jobId || '');

      const result = await createAptitudeTest(companyId, formData);

      if (result && result.data) {
        setMessage({ 
          type: 'success', 
          text: `✅ Aptitude test "${result.data.testName}" created successfully!` 
        });

        // Reset form
        setTestData({
          testName: '',
          testDescription: '',
          timeLimit: 60,
          jobId: null,
          totalMarks: 100,
          marksPerQuestion: 1,
          passingScore: 60,
          maxAttempts: 1,
          minCGPA: 0,
          shuffleQuestions: true,
          negativeMarking: {
            enabled: false,
            marksPerWrong: 0.5
          },
          answerKey: ''
        });
        setPdfFile(null);

        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error creating test:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create aptitude test' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create Aptitude Test 📝</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message Alert */}
            {message.text && (
              <div className={`p-4 rounded-xl border-l-4 flex items-gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <span className="mr-2">{message.type === 'success' ? '✅' : '❌'}</span>
                {message.text}
              </div>
            )}

            {/* Basic Info */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name *</label>
                  <input
                    type="text"
                    name="testName"
                    value={testData.testName}
                    onChange={handleInputChange}
                    placeholder="e.g., Core Java Fundamentals"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="testDescription"
                    value={testData.testDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description of the test (optional)"
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link to Job (optional)</label>
                  <select
                    name="jobId"
                    value={testData.jobId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="">Standalone Test (No specific job)</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.jobTitle} - {job.location}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {jobsLoading ? 'Loading your jobs...' : `You have ${jobs.length} job(s) available.`}
                  </p>
                </div>
              </div>
            </section>

            {/* PDF Upload */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Question Paper</h3>

              <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer bg-blue-50/30">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdfInput"
                />
                <label htmlFor="pdfInput" className="cursor-pointer">
                  <FiUpload className="text-4xl text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-800">Click to upload PDF</p>
                  <p className="text-sm text-gray-600 mt-1">or drag and drop</p>
                  {pdfFile && (
                    <p className="text-sm text-green-600 mt-2">✅ {pdfFile.name}</p>
                  )}
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                💡 Tip: Each page of the PDF = 1 question. The system will convert each page to an image and display it to students.
              </p>
            </section>

            {/* Answer Key */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Answer Key *</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Answers (comma-separated: A, B, C, A, D...)
                </label>
                <textarea
                  name="answerKey"
                  value={testData.answerKey}
                  onChange={handleInputChange}
                  placeholder="A, B, C, A, D, B, C, D"
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter one answer per line or comma-separated. Must match the number of PDF pages.
                </p>
              </div>
            </section>

            {/* Scoring */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Scoring Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={testData.totalMarks}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marks per Question</label>
                  <input
                    type="number"
                    name="marksPerQuestion"
                    value={testData.marksPerQuestion}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    name="passingScore"
                    value={testData.passingScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min CGPA</label>
                  <input
                    type="number"
                    name="minCGPA"
                    value={testData.minCGPA}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Negative Marking */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="negativeMarking.enabled"
                    checked={testData.negativeMarking.enabled}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Enable Negative Marking</span>
                </label>

                {testData.negativeMarking.enabled && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marks deducted per wrong answer</label>
                    <input
                      type="number"
                      name="negativeMarking.marksPerWrong"
                      value={testData.negativeMarking.marksPerWrong}
                      onChange={handleInputChange}
                      min="0"
                      step="0.25"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Test Restrictions */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Test Restrictions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={testData.timeLimit}
                    onChange={handleInputChange}
                    min="5"
                    max="480"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Attempts</label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={testData.maxAttempts}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                ⚠️ Note: Tab switch limit is fixed at 3. On the 4th tab switch, the test auto-submits.
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={testData.shuffleQuestions}
                    onChange={(e) => setTestData({ ...testData, shuffleQuestions: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Shuffle question order for each student</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended to reduce cheating. Every student gets same questions in different order.</p>
              </div>
            </section>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Creating Test...' : '✅ Create Aptitude Test'}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <FiAlertCircle /> Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Each PDF page = 1 question</li>
              <li>✓ System auto-converts pages to images</li>
              <li>✓ Students see pixel-perfect questions</li>
              <li>✓ Works with all math symbols (∫, √, ∂, etc.)</li>
              <li>✓ Answers are NOT visible to students</li>
              <li>✓ Tab switches auto-submit on 4th attempt</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <FiCheckCircle /> Answer Key Format
            </h3>
            <div className="bg-white p-3 rounded-lg font-mono text-xs text-gray-700 space-y-1">
              <div>A, B, C, A, D</div>
              <p className="text-gray-500 mt-2">OR each on new line:</p>
              <div>A<br/>B<br/>C<br/>A<br/>D</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
