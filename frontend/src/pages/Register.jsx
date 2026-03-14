import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import {
  registerUser,
  requestStudentRegistrationOtp,
  verifyStudentRegistrationOtp,
  completeStudentRegistration
} from '../services/api.js';

function Register() {
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');

  const [studentStep, setStudentStep] = useState('enrollment');
  const [otp, setOtp] = useState('');
  const [otpContact, setOtpContact] = useState('');
  const [otpSentForEnrollment, setOtpSentForEnrollment] = useState('');
  const [otpRequestedFor, setOtpRequestedFor] = useState('');
  const [toast, setToast] = useState({
    open: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [formData, setFormData] = useState({
    enrollmentNo: '',
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    username: '',
    Location: ''
  });

  const navigate = useNavigate();
  const otpTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = ({ type = 'info', title = '', message = '', duration = 4500 }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ open: true, type, title, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, duration);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    setShowPassword(false);
    setError('');
    if (role !== 'student') {
      setStudentStep('enrollment');
      setOtp('');
      setOtpContact('');
      setOtpSentForEnrollment('');
      setOtpRequestedFor('');
    }
  }, [role]);

  useEffect(() => {
    if (role !== 'student') return;
    if (studentStep !== 'enrollment') return;

    const normalizedEnrollment = String(formData.enrollmentNo || '').trim().toUpperCase();
    const enrollmentRegex = /^\d{2}BE[A-Z]{2}\d{5}$/;

    if (!enrollmentRegex.test(normalizedEnrollment)) {
      return;
    }

    if (normalizedEnrollment === otpRequestedFor) {
      return;
    }

    otpTimerRef.current = setTimeout(() => {
      sendEnrollmentOtp(normalizedEnrollment);
    }, 600);

    return () => {
      if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    };
  }, [formData.enrollmentNo, role, studentStep, otpRequestedFor]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const validateEnrollmentNumber = (value) => {
    const enrollmentRegex = /^\d{2}BE[A-Z]{2}\d{5}$/;
    if (!value) {
      setEnrollmentError('');
      return false;
    }
    if (!enrollmentRegex.test(value.trim().toUpperCase())) {
      setEnrollmentError('Invalid format. Use: YYBEBRANCHTTT## (e.g., 23BEIT30055)');
      return false;
    }
    setEnrollmentError('');
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'enrollmentNo') {
      validateEnrollmentNumber(value);
      setOtpRequestedFor('');
      setOtpSentForEnrollment('');
      setOtp('');
      setStudentStep('enrollment');
    }
  };

  const sendEnrollmentOtp = async (normalizedEnrollmentInput) => {
    const normalizedEnrollment = (normalizedEnrollmentInput || formData.enrollmentNo).trim().toUpperCase();

    if (!validateEnrollmentNumber(normalizedEnrollment)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await requestStudentRegistrationOtp(normalizedEnrollment);
      setOtpContact(response?.data?.otpContact || 'Registered mobile number');
      setOtpSentForEnrollment(normalizedEnrollment);
      setOtpRequestedFor(normalizedEnrollment);
      setStudentStep('otp');

      if (response?.data?.otpChannel === 'dev' && response?.data?.devOtp) {
        showToast({
          type: 'info',
          title: 'Development OTP Mode',
          message: `Use OTP: ${response.data.devOtp}`,
          duration: 7000
        });
      } else {
        showToast({
          type: 'success',
          title: 'OTP Sent',
          message: `Sent to ${response?.data?.otpContact || 'registered mobile number'}`
        });
      }
    } catch (err) {
      const raw = String(err?.message || 'Unable to send OTP');
      if (raw.includes('21608') || raw.toLowerCase().includes('trial account can only send otp to verified numbers')) {
        setError('Twilio trial limit on current SMS account. Ask admin to enable development fallback or upgrade Twilio account.');
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await verifyStudentRegistrationOtp(otpSentForEnrollment, otp);
      setStudentStep('details');
      setOtp('');
      showToast({
        type: 'success',
        title: 'OTP Verified',
        message: 'Now set your details and password.'
      });
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'student') {
        if (studentStep !== 'details') {
          setError('Please verify enrollment OTP first.');
          setLoading(false);
          return;
        }

        if (!formData.fullName?.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }

        if (!formData.email?.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }

        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const payload = {
          enrollmentNo: otpSentForEnrollment,
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          branch: '',
          skills: [],
          resumeUrl: ''
        };

        await completeStudentRegistration(payload);
        showToast({
          type: 'success',
          title: 'Registration Successful',
          message: 'You can now login with enrollment and password.'
        });
        navigate('/login');
        return;
      }

      if (role === 'company') {
        const dataToSend = {
          role,
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          Location: formData.Location,
          jobPostings: [],
          about: ' write the about section'
        };

        const response = await registerUser(dataToSend);
        const createdCompany = response?.data;
        if (createdCompany?._id) {
          localStorage.setItem('userId', createdCompany._id);
          localStorage.setItem('companyId', createdCompany._id);
          localStorage.setItem('role', 'company');
          localStorage.setItem('userRole', 'company');
          localStorage.setItem('companyData', JSON.stringify(createdCompany));
        }

        showToast({
          type: 'success',
          title: 'Registration Successful',
          message: 'Complete your company profile.'
        });
        navigate('/company/profile');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    'w-full px-4 py-3 rounded-lg bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition';

  const isEnrollmentFormatValid = /^\d{2}BE[A-Z]{2}\d{5}$/.test(
    String(formData.enrollmentNo || '').trim().toUpperCase()
  );

  const toastStyles = {
    success: {
      card: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    },
    error: {
      card: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />
    },
    info: {
      card: 'bg-sky-50 border-sky-200 text-sky-800',
      icon: <Info className="w-5 h-5 text-sky-600" />
    }
  };

  const activeToast = toastStyles[toast.type] || toastStyles.info;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {toast.open && (
        <div className="fixed top-5 right-5 z-50 w-[92%] max-w-sm animate-[fadeIn_.25s_ease-out]">
          <div className={`rounded-xl border shadow-lg backdrop-blur-sm p-4 ${activeToast.card}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{activeToast.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{toast.title}</p>
                <p className="text-sm mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={closeToast}
                className="opacity-70 hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full p-5 flex lg:w-1/2 bg-gradient-to-tr from-cyan-800 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-3xl font-extrabold mb-4">Let&apos;s build a career!</h1>
          <p className="text-lg">Unlock opportunities, connect with top companies, and grow your career.</p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>

          <div className="flex justify-center gap-3 mb-6">
            {['student', 'company'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  role === r
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            {role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Enrollment No.</label>
                  <input
                    className={`${inputStyle} border-2 ${enrollmentError ? 'border-red-400' : 'border-blue-300'} focus:border-blue-500 uppercase`}
                    placeholder="e.g. 23BEIT30055"
                    name="enrollmentNo"
                    value={formData.enrollmentNo}
                    onChange={handleInputChange}
                    disabled={studentStep === 'details'}
                    required
                  />
                  {enrollmentError && <p className="text-xs text-red-600 mt-1">{enrollmentError}</p>}
                  {studentStep === 'enrollment' && (
                    <button
                      type="button"
                      onClick={() => sendEnrollmentOtp()}
                      disabled={loading || !isEnrollmentFormatValid}
                      className="mt-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {studentStep === 'otp' && (
                  <>
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                      OTP sent to: {otpContact}
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 text-center text-xl tracking-widest border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </>
                )}

                {studentStep === 'details' && (
                  <>
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                      OTP verified. Now set your account details.
                    </div>
                    <input
                      className={inputStyle}
                      placeholder="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      className={inputStyle}
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      required
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`${inputStyle} pr-14`}
                        placeholder="Password (min 6 characters)"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-medium"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-2xl disabled:bg-gray-400"
                    >
                      {loading ? 'Creating account...' : 'Complete Registration'}
                    </button>
                  </>
                )}
              </>
            )}

            {role === 'company' && (
              <>
                <input
                  className={inputStyle}
                  placeholder="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className={inputStyle}
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className={inputStyle}
                  placeholder="Location"
                  name="Location"
                  value={formData.Location}
                  onChange={handleInputChange}
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputStyle} pr-14`}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-2xl disabled:bg-gray-400"
                >
                  {loading ? 'Registering...' : 'Register as company'}
                </button>
              </>
            )}
          </form>

          <p className="text-center text-gray-500 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-800 font-medium hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
