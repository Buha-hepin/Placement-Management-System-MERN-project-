/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { startTest, saveAnswer, submitTest } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const resolveQuestionAssetUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function TakeAptitudeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const studentId = localStorage.getItem('studentId');
  const [test, setTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const hasInitializedRef = useRef(false);

  // Initialize test
  useEffect(() => {
    if (!studentId || !testId || hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    const initializeTest = async () => {
      try {
        setLoading(true);
        const result = await startTest(testId, studentId);

        if (result && result.data) {
          setTest(result.data);
          setAttemptId(result.data.attemptId);
          setTimeLeft(result.data.timeLimit * 60); // Convert to seconds
          setAnswers(new Array(result.data.totalQuestions).fill(null));
        }
      } catch (error) {
        console.error('Error starting test:', error);
        window.appAlert('Failed to start test: ' + error.message);
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, [testId, studentId, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft == null || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleAutoSubmit('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testCompleted]);

  // Tab switch detection using visibilitychange and focus/blur events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab lost focus
        const newSwitches = tabSwitches + 1;
        setTabSwitches(newSwitches);
        setShowWarning(true);

        setTimeout(() => setShowWarning(false), 3000);

        if (newSwitches >= 4) {
          handleAutoSubmit('tab_switch');
        }
      }
    };

    const handleWindowBlur = () => {
      const newSwitches = tabSwitches + 1;
      setTabSwitches(newSwitches);
      setShowWarning(true);

      setTimeout(() => setShowWarning(false), 3000);

      if (newSwitches >= 4) {
        handleAutoSubmit('tab_switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [tabSwitches, testCompleted]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = async (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    // Auto-save answer to backend
    try {
      const originalQuestionIndex = test?.questions?.[currentQuestion]?.originalIndex ?? currentQuestion;
      await saveAnswer(attemptId, originalQuestionIndex, answer, tabSwitches);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  // Navigate between questions
  const goToPrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const goToNext = () => {
    if (currentQuestion < test.totalQuestions - 1) setCurrentQuestion(currentQuestion + 1);
  };

  // Auto-submit logic
  const handleAutoSubmit = async () => {
    setTestCompleted(true);
    setSubmitting(true);

    try {
      const result = await submitTest(attemptId);
      if (result && result.data) {
        setTestResults(result.data);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      window.appAlert('Error submitting test: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Manual submit
  const handleManualSubmit = async () => {
    if (await window.appConfirm('Are you sure you want to submit the test? You cannot review or change answers after submission.')) {
      handleAutoSubmit('completed');
    }
  };

  // Show results page
  if (testCompleted && testResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className={`text-6xl font-bold mb-4 ${testResults.passed ? 'text-green-500' : 'text-red-500'}`}>
              {testResults.passed ? '🎉' : '📊'}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {testResults.passed ? 'Test Passed!' : 'Test Completed'}
            </h1>

            <div className="bg-gray-50 p-6 rounded-xl my-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Score</p>
                  <p className="text-3xl font-bold text-blue-600">{testResults.score}/{100}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Percentage</p>
                  <p className="text-3xl font-bold text-cyan-600">{testResults.percentage}%</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Correct</p>
                  <p className="text-2xl font-bold text-green-600">✓ {testResults.correctAnswers}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Wrong</p>
                  <p className="text-2xl font-bold text-red-600">✗ {testResults.wrongAnswers}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/student')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Starting test...</p>
        </div>
      </div>
    );
  }

  if (!test || !test.questions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Test not found</p>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const currentQuestionAssetUrl = resolveQuestionAssetUrl(currentQ?.imageUrl || currentQ?.pdfUrl);
  const timeExceeded = timeLeft <= 0;
  const warningThreshold = test.timeLimit * 60 * 0.1; // 10% of time left

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-6">
      {/* Header with Timer */}
      <header className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Aptitude Test</h1>
            <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {test.totalQuestions}</p>
          </div>

          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-lg ${
            timeExceeded ? 'bg-red-100 text-red-700' :
            timeLeft < warningThreshold ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            <FiClock size={24} />
            {formatTime(timeLeft)}
          </div>

          <div className={`text-sm px-3 py-1 rounded-lg ${
            tabSwitches >= 3 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            Tab switches: {tabSwitches}/3
          </div>
        </div>
      </header>

      {/* Warning Messages */}
      {showWarning && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-xl mb-4 flex items-start gap-3">
          <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">❌ Tab Switch Detected</p>
            <p className="text-sm">You have {3 - tabSwitches} tab switches remaining. Test will auto-submit after the 3rd switch.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Questions Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 sticky top-20">
            <h3 className="font-bold text-gray-800 mb-3">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {test.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition ${
                    idx === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[idx]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            {/* Question Image */}
            <div className="mb-6 bg-gray-100 rounded-xl p-4 flex items-center justify-center overflow-auto max-h-[50vh]">
              {currentQ && currentQ.imageUrl ? (
                <img
                  src={currentQuestionAssetUrl}
                  alt={`Question ${currentQuestion + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : currentQ?.pdfUrl ? (
                <iframe
                  title={`Question ${currentQuestion + 1}`}
                  src={`${currentQuestionAssetUrl}#page=${currentQ.pdfPageNumber || 1}&zoom=page-width`}
                  className="w-full h-[60vh] rounded-lg bg-white"
                />
              ) : (
                <p className="text-gray-500">Question image not available</p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 rounded-xl text-left font-semibold transition-all flex items-center gap-3 ${
                    answers[currentQuestion] === option
                      ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <span className="inline-flex min-w-10 h-8 px-3 rounded-lg border border-current items-center justify-center text-sm font-bold">
                    {option}
                  </span>
                  <span>Option {option}</span>
                </button>
              ))}
            </div>

            {/* Navigation and Submit */}
            <div className="flex gap-3 justify-between">
              <button
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft /> Previous
              </button>

              {currentQuestion === test.totalQuestions - 1 ? (
                <button
                  onClick={handleManualSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? '⏳ Submitting...' : '✅ Submit Test'}
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  Next <FiChevronRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
